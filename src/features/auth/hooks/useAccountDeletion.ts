import { useState } from "react";
import { d1 } from "../../../lib/d1";

interface UseAccountDeletionProps {
  currentUser: any;
  userProfile: any;
  logout: () => Promise<void>;
}

export function useAccountDeletion({ currentUser, userProfile, logout }: UseAccountDeletionProps) {
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [clientDeleteReason, setClientDeleteReason] = useState("My presentation project is complete");
  const [clientDeleteCustomReason, setClientDeleteCustomReason] = useState("");
  const [clientDeleteComments, setClientDeleteComments] = useState("");
  const [clientDeleteConfirmation, setClientDeleteConfirmation] = useState("");
  const [isDeletingClientAccount, setIsDeletingClientAccount] = useState(false);
  const [accountDeletedNotice, setAccountDeletedNotice] = useState("");

  const handleDeleteMyAccount = async () => {
    if (clientDeleteConfirmation.trim().toUpperCase() !== "DELETE") {
      alert("Please type DELETE to confirm account closure.");
      return;
    }

    if (!currentUser?.email) return;

    setIsDeletingClientAccount(true);
    try {
      const finalReason = clientDeleteCustomReason.trim() || clientDeleteReason;

      const { data: sessionData } = await d1.auth.getSession();
      const authToken = sessionData?.session?.access_token || "";
      const userId = currentUser?.id || sessionData?.session?.user?.id || "";

      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken
            ? { Authorization: `Bearer ${authToken}` }
            : userId
            ? { Authorization: `Bearer ${userId}` }
            : {}),
          ...(userId ? { "x-user-id": userId } : {}),
        },
        body: JSON.stringify({
          targetEmail: currentUser.email,
          targetUserId: userId,
          reason: finalReason,
          customNotes: clientDeleteComments,
          sendNotice: true,
          clientName: userProfile?.full_name || currentUser.email.split("@")[0],
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server could not process account deletion.");
      }

      await logout();
      setIsDeleteAccountOpen(false);
      setAccountDeletedNotice(
        "Your SlideBee client account has been permanently deleted and personal data purged. A confirmation notice with your deletion details has been sent to your email."
      );
    } catch (err: any) {
      console.error("Account deletion failed:", err);
      alert(`Account deletion failed: ${err?.message || err}`);
    } finally {
      setIsDeletingClientAccount(false);
    }
  };

  return {
    isDeleteAccountOpen,
    setIsDeleteAccountOpen,
    clientDeleteReason,
    setClientDeleteReason,
    clientDeleteCustomReason,
    setClientDeleteCustomReason,
    clientDeleteComments,
    setClientDeleteComments,
    clientDeleteConfirmation,
    setClientDeleteConfirmation,
    isDeletingClientAccount,
    accountDeletedNotice,
    handleDeleteMyAccount,
  };
}
