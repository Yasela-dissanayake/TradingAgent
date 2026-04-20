import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Handles the redirect from Supabase confirmation emails.
 * Supabase appends #access_token=...&type=signup to the URL.
 * We parse the hash, extract the user id from the JWT, store it,
 * then redirect to the dashboard.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1); // strip leading '#'
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const type = params.get("type"); // "signup" or "recovery"

    if (accessToken) {
      // Decode JWT payload (base64url middle segment) — no verification needed here,
      // the backend already trusts Supabase-issued tokens.
      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const userId = payload.sub;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("userId", userId);

        if (type === "signup") {
          // Email confirmed — show a brief message then redirect
          navigate("/dashboard");
        } else {
          navigate("/dashboard");
        }
      } catch {
        // Malformed token — fall back to auth page
        navigate("/auth");
      }
    } else {
      navigate("/auth");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-white">
      <p className="text-muted">Verifying your account…</p>
    </div>
  );
}
