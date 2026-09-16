import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  acceptTeamInvitation,
} from "../../services/teamService";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");

  const [message, setMessage] = useState(
    "Accepting your invitation..."
  );

  useEffect(() => {
    const acceptInvitation = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage(
          "Invalid invitation link. No invitation token was found."
        );
        return;
      }

      try {
        const result =
          await acceptTeamInvitation(token);

        if (!result?.success) {
          throw new Error(
            result?.message ||
              "Unable to accept invitation."
          );
        }

        setStatus("success");

        setMessage(
          "Your invitation has been accepted successfully. Your team member status is now Active."
        );
      } catch (error) {
        console.error(
          "Accept invitation error:",
          error
        );

        setStatus("error");

        setMessage(
          error?.response?.data?.message ||
            error?.message ||
            "This invitation is invalid or has already been accepted."
        );
      }
    };

    acceptInvitation();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          {/* ICON */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
            <span className="material-symbols-outlined text-3xl text-teal-600">
              {status === "loading"
                ? "hourglass_top"
                : status === "success"
                ? "check_circle"
                : "error"}
            </span>
          </div>

          {/* TITLE */}
          <h1 className="text-2xl font-semibold text-slate-900">
            {status === "loading"
              ? "Accepting Invitation"
              : status === "success"
              ? "Invitation Accepted"
              : "Invitation Error"}
          </h1>

          {/* MESSAGE */}
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {message}
          </p>

          {/* LOADING */}
          {status === "loading" && (
            <div className="mt-6">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-teal-600" />
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {status === "success" && (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 w-full rounded-lg bg-teal-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-700"
            >
              Continue to Login
            </button>
          )}

          {/* ERROR */}
          {status === "error" && (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}