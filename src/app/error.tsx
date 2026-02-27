"use client";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="error-page">
            <div className="error-code">500</div>
            <h1 className="error-title">Something went wrong</h1>
            <p className="error-message">
                An unexpected error occurred. Please try again.
            </p>
            <button onClick={reset} className="btn btn-primary">
                Try Again
            </button>
        </div>
    );
}
