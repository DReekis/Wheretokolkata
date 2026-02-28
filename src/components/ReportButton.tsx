"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type ReportTargetType = "place" | "comment";

interface ReportButtonProps {
    targetType: ReportTargetType;
    targetId: string;
    compact?: boolean;
}

export default function ReportButton({ targetType, targetId, compact = false }: ReportButtonProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [reported, setReported] = useState(false);
    const [error, setError] = useState("");

    const handleReport = async () => {
        if (!user || loading || reported) return;

        const confirmed = window.confirm("Report this content for moderator review?");
        if (!confirmed) return;

        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetType,
                    targetId,
                    reason: "other",
                    details: "",
                }),
            });

            if (res.ok || res.status === 409) {
                setReported(true);
            } else {
                const data = await res.json();
                setError(data.error || "Could not submit report.");
            }
        } catch {
            setError("Could not submit report.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
            <button
                type="button"
                className={`btn ${compact ? "btn-ghost btn-sm" : "btn-secondary btn-sm"}`}
                onClick={handleReport}
                disabled={loading || reported}
            >
                {reported ? "Reported" : loading ? "Reporting..." : "Report"}
            </button>
            {error && <span className="form-error">{error}</span>}
        </div>
    );
}
