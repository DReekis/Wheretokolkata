"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import VoteButtons from "@/components/VoteButtons";
import SaveButton from "@/components/SaveButton";
import VerifyVisitButton from "@/components/VerifyVisitButton";
import CommentSection from "@/components/CommentSection";
import { useAuth } from "@/contexts/AuthContext";
import { getScoreLabel, getScorePercentage } from "@/lib/ranking";

interface PlaceData {
    _id: string;
    name: string;
    city: string;
    description: string;
    category: string;
    tags: string[];
    best_time: string;
    image_urls: string[];
    upvotes: number;
    downvotes: number;
    score: number;
    status: string;
    visit_confirmations: number;
    created_by: { _id: string; username: string };
    created_at: string;
}

const categoryClass: Record<string, string> = {
    Food: "badge-food",
    Cafes: "badge-cafes",
    Viewpoints: "badge-viewpoints",
    Nature: "badge-nature",
    "Study Spots": "badge-study",
    Culture: "badge-culture",
    "Hidden Gems": "badge-hidden",
    "Night Spots": "badge-night",
};

export default function PlaceDetailPage() {
    const params = useParams();
    const { user } = useAuth();
    const id = params.id as string;
    const city = params.city as string;

    const [place, setPlace] = useState<PlaceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPlace = useCallback(async () => {
        try {
            const res = await fetch(`/api/places/${id}`);
            if (!res.ok) {
                setError("Place not found.");
                return;
            }
            const data = await res.json();
            setPlace(data.place);
        } catch {
            setError("Something went wrong.");
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchPlace();
    }, [fetchPlace]);

    if (loading) {
        return (
            <div className="page">
                <div className="content-container" style={{ textAlign: "center", padding: "var(--space-12)" }}>
                    <div className="spinner" style={{ margin: "0 auto" }} />
                </div>
            </div>
        );
    }

    if (error || !place) {
        return (
            <div className="page">
                <div className="content-container">
                    <div className="empty-state">
                        <div className="empty-state-icon">😔</div>
                        <p className="empty-state-title">{error || "Place not found"}</p>
                    </div>
                </div>
            </div>
        );
    }

    const scorePercent = getScorePercentage(place.score);
    const scoreLabel = getScoreLabel(place.score);

    return (
        <div className="page" style={{ paddingBottom: "calc(var(--mobile-nav-height) + var(--space-12))" }}>
            {/* Hero Image */}
            {place.image_urls?.[0] && (
                <img src={place.image_urls[0]} alt={place.name} className="place-hero" />
            )}

            <div className="content-container">
                <div className="place-info">
                    {/* Category Badge */}
                    <div style={{ marginBottom: "var(--space-3)" }}>
                        <span className={`badge ${categoryClass[place.category] || ""}`}>{place.category}</span>
                    </div>

                    {/* Name */}
                    <h1 className="place-name">{place.name}</h1>

                    {/* Score */}
                    <div className="place-score-row">
                        <span className="badge badge-score" style={{ fontSize: "var(--font-size-sm)", padding: "var(--space-1) var(--space-3)" }}>
                            {scorePercent > 0 ? `${scorePercent}% Recommended` : "No votes yet"}
                        </span>
                        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>
                            {scoreLabel}
                        </span>
                    </div>

                    {/* Verification */}
                    {place.visit_confirmations > 0 && (
                        <div className="place-verification">
                            ✔ Verified by {place.visit_confirmations} visitor{place.visit_confirmations !== 1 ? "s" : ""}
                        </div>
                    )}

                    {/* Tags */}
                    {place.tags.length > 0 && (
                        <div className="place-tags" style={{ marginTop: "var(--space-3)" }}>
                            {place.tags.map((tag) => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Best time */}
                    {place.best_time && (
                        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", marginTop: "var(--space-2)" }}>
                            🕐 Best time: {place.best_time}
                        </p>
                    )}

                    {/* Description */}
                    <p className="place-description" style={{ marginTop: "var(--space-4)" }}>{place.description}</p>

                    {/* Gallery */}
                    {place.image_urls.length > 1 && (
                        <div className="place-gallery">
                            {place.image_urls.map((url, i) => (
                                <img key={i} src={url} alt={`${place.name} ${i + 1}`} loading="lazy" />
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="place-actions">
                        <VoteButtons
                            placeId={place._id}
                            initialUpvotes={place.upvotes}
                            initialDownvotes={place.downvotes}
                            initialScore={place.score}
                            createdBy={place.created_by._id}
                        />
                        <SaveButton placeId={place._id} initialSaved={false} />
                        <VerifyVisitButton
                            placeId={place._id}
                            initialConfirmed={false}
                            confirmations={place.visit_confirmations}
                        />
                    </div>

                    {/* Author info */}
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginBottom: "var(--space-6)" }}>
                        Added by <strong>{place.created_by.username}</strong> · {new Date(place.created_at).toLocaleDateString()}
                    </p>

                    {/* Comments */}
                    <CommentSection placeId={place._id} />
                </div>
            </div>
        </div>
    );
}
