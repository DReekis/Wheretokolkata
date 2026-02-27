"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface VerifyVisitButtonProps {
    placeId: string;
    initialConfirmed: boolean;
    confirmations: number;
}

export default function VerifyVisitButton({ placeId, initialConfirmed, confirmations }: VerifyVisitButtonProps) {
    const { user } = useAuth();
    const [confirmed, setConfirmed] = useState(initialConfirmed);
    const [count, setCount] = useState(confirmations);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!user || confirmed || loading) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/places/${placeId}/verify`, { method: "POST" });
            if (res.ok) {
                setConfirmed(true);
                setCount((c) => c + 1);
            }
        } catch {
            // silent
        }
        setLoading(false);
    };

    if (!user) return null;

    return (
        <button
            className={`btn ${confirmed ? "btn-primary" : "btn-secondary"} btn-sm`}
            onClick={handleConfirm}
            disabled={confirmed || loading}
        >
            ✔ {confirmed ? "Verified" : "I visited recently"}{count > 0 ? ` (${count})` : ""}
        </button>
    );
}
