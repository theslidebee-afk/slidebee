import { d1 } from "../../lib/d1";
import { isDisposableEmail, getDeviceFingerprint } from "../../lib/deviceFingerprint";
import { registerActiveSession } from "../../lib/sessionGuard";
import { sendWelcomeEmail } from "../../lib/email";
import { recordAuthEvent } from "./clientLedgerStorage";

export async function performSignUp(
  emailInput: string,
  passwordInput: string,
  fullNameInput: string,
  companyInput: string
) {
  const cleanEmail = emailInput.toLowerCase().trim();
  const cleanPassword = passwordInput.trim();
  const cleanName = fullNameInput.trim();
  const cleanCompany = companyInput.trim() || "Client Enterprise";

  if (!cleanName) throw new Error("Please enter your full name.");
  if (cleanPassword.length < 8 || !/[A-Z]/.test(cleanPassword) || !/[0-9]/.test(cleanPassword)) {
    throw new Error(
      "Password must be at least 8 characters long and contain at least one uppercase letter and one number."
    );
  }

  // 1. Block disposable and burner temporary email domains
  if (isDisposableEmail(cleanEmail)) {
    throw new Error(
      "Disposable or temporary email addresses are not permitted. Please use a valid personal or corporate email."
    );
  }

  // 2. Hardware and device fingerprinting for trial anti-abuse check
  const fingerprint = await getDeviceFingerprint();
  let trialEligible = true;

  try {
    const trialCheckRes = await fetch("/api/trial-guard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CHECK_AND_CLAIM",
        email: cleanEmail,
        deviceFingerprint: fingerprint,
      }),
    });

    if (trialCheckRes.ok) {
      const trialData = await trialCheckRes.json();
      if (trialData && trialData.eligible === false) {
        trialEligible = false;
      }
    }
  } catch (trialGuardErr) {
    console.warn("Trial guard pre-check notice:", trialGuardErr);
  }

  // 3. Check duplicate account
  const { data: existingProfile } = await d1
    .from("profiles")
    .select("id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existingProfile) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  // 4. Register in D1 Auth
  const { data: authData, error: authErr } = await d1.auth.signUp({
    email: cleanEmail,
    password: cleanPassword,
    options: {
      data: {
        full_name: cleanName,
        company: cleanCompany,
      },
    },
  });

  if (authErr) {
    throw new Error(authErr.message || "Failed to register account.");
  }

  // 5. Enforce trial provisioning or zero credits if already claimed
  if (trialEligible) {
    try {
      await d1.rpc("fn_grant_starter_credits", {
        p_email: cleanEmail,
        p_full_name: cleanName,
        p_company: cleanCompany,
      });
    } catch (e) {
      console.warn("Free tier provisioning RPC notice:", e);
    }
  } else {
    try {
      await d1.from("profiles").upsert(
        {
          email: cleanEmail,
          full_name: cleanName,
          company: cleanCompany,
          role: "client",
          credits_total: 0,
          credits_used: 0,
          credits_balance: 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
    } catch (profileErr) {
      console.warn("Profile zero-credit initialization notice:", profileErr);
    }
  }

  // 6. Register this device as the active session
  await registerActiveSession(cleanEmail);

  await recordAuthEvent(cleanEmail, "SIGNUP", {
    fullName: cleanName,
    company: cleanCompany,
    trialEligible,
    deviceFingerprint: fingerprint,
  });

  sendWelcomeEmail({
    clientName: cleanName || cleanEmail.split("@")[0],
    clientEmail: cleanEmail,
    company: cleanCompany,
  }).catch((err) => console.warn("Welcome email notice:", err));

  return {
    authData,
    cleanEmail,
    trialEligible,
  };
}

export async function performCompletePasswordReset(
  newPasswordInput: string,
  token?: string,
  email?: string
): Promise<{ success: boolean; message: string; user?: any }> {
  const cleanPass = newPasswordInput.trim();
  if (!cleanPass || cleanPass.length < 8) {
    return { success: false, message: "Password must be at least 8 characters in length." };
  }

  try {
    if (token) {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password_confirm",
          token,
          email,
          password: cleanPass,
        }),
      });
      const json = await res.json();
      if (res.ok && !json.error) {
        if (json.data?.session) {
          localStorage.setItem("slidebee_edge_session", JSON.stringify(json.data.session));
          if (json.data.user) {
            localStorage.setItem(
              "slidebee_client_user",
              JSON.stringify({
                email: json.data.user.email,
                tier: json.data.profile?.tier || "free",
                role: json.data.user.role || "client",
                user_metadata: json.data.user.user_metadata,
              })
            );
          }
        }
        return {
          success: true,
          message: "Password has been successfully updated.",
          user: json.data?.user,
        };
      } else if (json.error) {
        return { success: false, message: json.error.message || "Password update failed." };
      }
    }

    const { data, error } = await d1.auth.updateUser({
      password: cleanPass,
      email,
    });
    if (error) {
      return {
        success: false,
        message: error.message || "Failed to update password. Recovery link may have expired.",
      };
    }
    if (data?.user) {
      await recordAuthEvent(data.user.email || "unknown", "PASSWORD_RESET", { provider: "d1_auth" });
      return { success: true, message: "Password has been successfully updated.", user: data.user };
    }
    return { success: true, message: "Password has been updated." };
  } catch (err: any) {
    return { success: false, message: err.message || "Password update failed. Please try again." };
  }
}

export async function performTemplateDownload(emailToUse: string, templateId: string) {
  try {
    const res = await fetch("/api/entitlement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId,
        userEmail: emailToUse,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to download template.");
    }
    return data;
  } catch (err: any) {
    const { data, error } = await d1.rpc("fn_redeem_template_credit", {
      p_user_email: emailToUse,
      p_template_id: templateId,
    });

    if (error) {
      throw new Error(error.message || err.message || "Download failed.");
    }
    return data;
  }
}
