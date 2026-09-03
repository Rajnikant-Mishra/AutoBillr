import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

const REGISTRATION_STORAGE_KEY =
  "autobillr-registration-draft";

const REGISTRATION_EMAIL_KEY =
  "autobillr-registration-email";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(
    "Verifying your email..."
  );

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    let cancelled = false;

    const verifyEmail = async () => {
      try {
        console.log("VERIFY TOKEN:", token);

        const response = await axios.get(
          `${API_URL}/email-verification/verify`,
          {
            params: {
              token,
            },
          }
        );

        console.log(
          "EMAIL VERIFICATION RESPONSE:",
          response.data
        );

        if (cancelled) return;

        if (response.data?.verified !== true) {
          throw new Error(
            response.data?.message ||
              "Email verification failed."
          );
        }

        // =====================================================
        // GET VERIFIED EMAIL
        // =====================================================

        let verifiedEmail =
          response.data?.email ||
          sessionStorage.getItem(
            REGISTRATION_EMAIL_KEY
          );

        // =====================================================
        // RESTORE REGISTRATION DRAFT
        // =====================================================

        let savedDraft = {};

        const storedDraft =
          sessionStorage.getItem(
            REGISTRATION_STORAGE_KEY
          );

        if (storedDraft) {
          try {
            savedDraft = JSON.parse(storedDraft);
          } catch (error) {
            console.error(
              "Unable to parse registration draft:",
              error
            );
          }
        }

        // Fallback to draft email
        if (!verifiedEmail && savedDraft.email) {
          verifiedEmail = savedDraft.email;
        }

        // Normalize email
        verifiedEmail = verifiedEmail
          ?.trim()
          .toLowerCase();

        if (!verifiedEmail) {
          throw new Error(
            "Unable to determine the verified email address."
          );
        }

        // =====================================================
        // SAVE VERIFIED EMAIL
        // =====================================================

        sessionStorage.setItem(
          REGISTRATION_EMAIL_KEY,
          verifiedEmail
        );

        // =====================================================
        // SAVE REGISTRATION DRAFT
        // =====================================================

        const updatedDraft = {
          ...savedDraft,
          email: verifiedEmail,
        };

        sessionStorage.setItem(
          REGISTRATION_STORAGE_KEY,
          JSON.stringify(updatedDraft)
        );

        // =====================================================
        // SUCCESS
        // =====================================================

        setStatus("success");

        setMessage(
          response.data?.message ||
            "Email verified successfully."
        );

        // =====================================================
        // REDIRECT TO REGISTER STEP 2
        // =====================================================

        const redirectUrl =
          `/register?verified=true&step=2&email=${encodeURIComponent(
            verifiedEmail
          )}`;

        console.log(
          "REDIRECTING TO:",
          redirectUrl
        );

        setTimeout(() => {
          if (!cancelled) {
            navigate(redirectUrl, {
              replace: true,
            });
          }
        }, 800);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "EMAIL VERIFICATION ERROR:",
          error
        );

        const backendMessage =
          error.response?.data?.message;

        setStatus("error");

        setMessage(
          backendMessage ||
            error.message ||
            "Unable to verify your email."
        );
      }
    };

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 text-center">

        {/* =====================================================
            LOADING
        ===================================================== */}

        {status === "loading" && (
          <>
            <span className="material-symbols-outlined text-primary text-5xl animate-spin">
              sync
            </span>

            <h1 className="text-xl font-bold text-text mt-4">
              Verifying your email
            </h1>

            <p className="text-sm text-text-muted mt-3">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {/* =====================================================
            SUCCESS
        ===================================================== */}

        {status === "success" && (
          <>
            <span className="material-symbols-outlined text-green-600 text-5xl">
              check_circle
            </span>

            <h1 className="text-xl font-bold text-text mt-4">
              Email verified successfully
            </h1>

            <p className="text-sm text-text-muted mt-3">
              {message}
            </p>

            <p className="text-sm text-primary font-semibold mt-4">
              Returning to registration...
            </p>
          </>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {status === "error" && (
          <>
            <span className="material-symbols-outlined text-danger text-5xl">
              error
            </span>

            <h1 className="text-xl font-bold text-text mt-4">
              Verification failed
            </h1>

            <p className="text-sm text-text-muted mt-3">
              {message}
            </p>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="mt-6 px-5 py-3 bg-primary text-white rounded-xl font-semibold"
            >
              Back to registration
            </button>
          </>
        )}
      </div>
    </div>
  );
}