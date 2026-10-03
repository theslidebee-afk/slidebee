import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { d1 } from "../../lib/d1";
import { performGlobalLogout, subscribeToAuthSync } from "../../lib/authSync";

export function useNavbarAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [clientUser, setClientUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<"free" | "monthly" | "yearly" | "lifetime">("free");

  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = async () => {
    const { data: { session } } = await d1.auth.getSession();

    if (!session?.user) {
      setIsAdmin(false);
      setClientUser(null);
      localStorage.removeItem("slidebee_admin_session");
      localStorage.removeItem("slidebee_admin_email");
      localStorage.removeItem("slidebee_client_user");
      return;
    }

    const email = session.user.email?.toLowerCase().trim() || "";
    const isSessionAdmin =
      email === "admin@theslidebee.com" ||
      session.user.user_metadata?.role === "admin" ||
      session.user.user_metadata?.role === "super_admin";

    if (isSessionAdmin) {
      setIsAdmin(true);
      setClientUser(null);
      localStorage.setItem("slidebee_admin_session", "true");
      return;
    }

    // Client user
    setIsAdmin(false);
    localStorage.removeItem("slidebee_admin_session");
    localStorage.removeItem("slidebee_admin_email");
    setClientUser(session.user);

    if (email) {
      try {
        const { data: profile } = await d1
          .from("profiles")
          .select("tier, role")
          .eq("email", email)
          .maybeSingle();
        if (profile) {
          if (profile.role === "admin" || profile.role === "super_admin") {
            setIsAdmin(true);
            setClientUser(null);
            localStorage.setItem("slidebee_admin_session", "true");
            return;
          }
          if (profile.tier) {
            setUserTier(profile.tier);
          }
        }
      } catch (err) {
        // preserve current state
      }
    }
  };

  useEffect(() => {
    checkAuth();

    const { data: authListener } = d1.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsAdmin(false);
        setClientUser(null);
        localStorage.removeItem("slidebee_admin_session");
        localStorage.removeItem("slidebee_admin_email");
        localStorage.removeItem("slidebee_client_user");
      } else {
        checkAuth();
      }
    });

    const unsubscribe = subscribeToAuthSync(
      (role) => {
        if (!role || role === "admin") {
          setIsAdmin(false);
          if (location.pathname.startsWith("/admin")) {
            navigate("/login");
          }
        }
        if (!role || role === "client") {
          setClientUser(null);
        }
        checkAuth();
      },
      (role) => {
        if (role === "client" && location.pathname.startsWith("/admin")) {
          navigate("/login");
        }
        checkAuth();
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
      unsubscribe();
    };
  }, [location.pathname, navigate]);

  const handleLogoutAdmin = async () => {
    await performGlobalLogout();
    setIsAdmin(false);
    setClientUser(null);
    navigate("/login");
  };

  return {
    isAdmin,
    clientUser,
    userTier,
    handleLogoutAdmin
  };
}
