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
    console.error("REACT CRASH:", error);
    console.error("REACT ERROR INFO:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow p-6">
            <h1 className="text-xl font-bold text-red-600 mb-3">
              Something went wrong
            </h1>

            <p className="text-slate-700 mb-4">
              The page crashed while rendering.
            </p>

            <pre className="bg-slate-100 rounded-lg p-4 text-sm text-red-700 overflow-auto">
              {this.state.error?.stack ||
                this.state.error?.message ||
                "Unknown React error"}
            </pre>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}