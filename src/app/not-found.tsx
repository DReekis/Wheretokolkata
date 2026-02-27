"use client";

import Link from "next/link";

export default function NotFoundPage() {
    return (
        <div className="error-page">
            <div className="error-code">404</div>
            <h1 className="error-title">Page Not Found</h1>
            <p className="error-message">
                The page you&apos;re looking for doesn&apos;t exist or the city is not yet supported.
            </p>
            <Link href="/kolkata/explore" className="btn btn-primary">
                Back to Explore
            </Link>
        </div>
    );
}
