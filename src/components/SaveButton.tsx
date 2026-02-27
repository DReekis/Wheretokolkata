"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SaveButtonProps {
    placeId: string;
    initialSaved: boolean;
}

export default function SaveButton({ placeId, initialSaved }: SaveButtonProps) {
    const { user } = useAuth();
    const [saved, setSaved] = useState(initialSaved);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        if (!user || loading) return;
        setLoading(true);
        setSaved(!saved);

        try {
            const res = await fetch("/api/saved", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ place_id: placeId }),
            });
            const data = await res.json();
            if (res.ok) {
                setSaved(data.saved);
            } else {
                setSaved(saved);
            }
        } catch {
            setSaved(saved);
        }
        setLoading(false);
    };

    if (!user) return null;

    return (
        <button
            className={`btn ${saved ? "btn-primary" : "btn-secondary"} btn-sm`}
            onClick={handleToggle}
            disabled={loading}
        >
            {saved ? "★ Saved" : "☆ Save"}
        </button>
    );
}
