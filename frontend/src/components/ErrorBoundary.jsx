import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      "React application error:",
      error
    );

    console.error(
      "React error info:",
      errorInfo
    );

    // Production:
    // Send error to Sentry / monitoring service here.
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isDevelopment =
      import.meta.env.DEV;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-3xl"
              aria-hidden="true"
            >
              error
            </span>
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            Something went wrong
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            We couldn't load this page. Please try
            again.
          </p>

          {isDevelopment &&
            this.state.error && (
              <pre className="mt-5 text-left bg-slate-100 rounded-xl p-4 text-xs text-red-700 overflow-auto max-h-48">
                {this.state.error.stack ||
                  this.state.error.message}
              </pre>
            )}

          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              aria-hidden="true"
            >
              refresh
            </span>

            Reload Application
          </button>
        </div>
      </div>
    );
  }
}