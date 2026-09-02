import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

const REGISTRATION_EMAIL_KEY =
  "autobillr-registration-email";

const REGISTRATION_VERIFIED_KEY =
  "autobillr-registration-verified";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState(
    "Verifying your email address..."
  );

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage(
        "Invalid or missing verification link."
      );
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(
          `${API_URL}/email-verification/verify?token=${encodeURIComponent(
            token
          )}`
        );

        const text = await response.text();

        let data = {};

        try {
          data = text
            ? JSON.parse(text)
            : {};
        } catch {
          throw new Error(
            "Invalid response from verification server."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Email verification failed."
          );
        }

        const email =
          data.email?.trim().toLowerCase();

        if (email) {
          localStorage.setItem(
            REGISTRATION_EMAIL_KEY,
            email
          );
        }

        localStorage.setItem(
          REGISTRATION_VERIFIED_KEY,
          "true"
        );

        setStatus("success");

        setMessage(
          "Your email has been verified successfully."
        );

        /*
         * IMPORTANT:
         *
         * DO NOT navigate to /register.
         * DO NOT reload the page.
         *
         * The original Register tab will detect
         * verification through WebSocket/polling.
         */
      } catch (error) {
        console.error(
          "Email verification error:",
          error
        );

        setStatus("error");

        setMessage(
          error.message ||
            "Unable to verify your email."
        );
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border p-8 text-center shadow-sm">

        {status === "verifying" && (
          <>
            <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-primary-soft grid place-items-center">
              <span className="material-symbols-outlined text-primary animate-spin">
                progress_activity
              </span>
            </div>

            <h1 className="text-2xl font-bold text-text">
              Verifying your email
            </h1>

            <p className="mt-3 text-sm text-text-muted">
              Please wait while we verify your
              email address.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-green-100 grid place-items-center">
              <span className="material-symbols-outlined text-green-600 text-3xl">
                verified
              </span>
            </div>

            <h1 className="text-2xl font-bold text-text">
              Email verified successfully
            </h1>

            <p className="mt-3 text-sm text-text-muted">
              Your email address has been verified.
            </p>

            <p className="mt-4 text-xs text-text-muted">
              You can close this tab and return to
              your registration page.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-red-100 grid place-items-center">
              <span className="material-symbols-outlined text-red-600 text-3xl">
                error
              </span>
            </div>

            <h1 className="text-2xl font-bold text-text">
              Verification failed
            </h1>

            <p className="mt-3 text-sm text-text-muted">
              {message}
            </p>
          </>
        )}

      </div>
    </div>
  );
}