"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { IconUp, IconDown } from "@/components/Icons";

interface VoteButtonsProps {
    placeId: string;
    initialUpvotes: number;
    initialDownvotes: number;
    initialScore: number;
    createdBy: string;
    userVote?: 1 | -1 | null;
}

export default function VoteButtons({ placeId, initialUpvotes, initialDownvotes, initialScore, createdBy, userVote }: VoteButtonsProps) {
    const { user } = useAuth();
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);
    const [score, setScore] = useState(initialScore);
    const [currentVote, setCurrentVote] = useState<1 | -1 | null>(userVote || null);
    const [loading, setLoading] = useState(false);

    const isSelf = user?.userId === createdBy;

    const handleVote = async (vote: 1 | -1) => {
        if (!user || isSelf || loading) return;
        setLoading(true);

        const prevUp = upvotes;
        const prevDown = downvotes;
        const prevVote = currentVote;

        if (currentVote === vote) {
            setLoading(false);
            return;
        }

        if (vote === 1) {
            setUpvotes((u) => u + 1);
            if (currentVote === -1) setDownvotes((d) => d - 1);
        } else {
            setDownvotes((d) => d + 1);
            if (currentVote === 1) setUpvotes((u) => u - 1);
        }
        setCurrentVote(vote);

        try {
            const res = await fetch("/api/votes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ place_id: placeId, vote }),
            });
            const data = await res.json();
            if (res.ok) {
                setUpvotes(data.upvotes);
                setDownvotes(data.downvotes);
                setScore(data.score);
            } else {
                setUpvotes(prevUp);
                setDownvotes(prevDown);
                setCurrentVote(prevVote);
            }
        } catch {
            setUpvotes(prevUp);
            setDownvotes(prevDown);
            setCurrentVote(prevVote);
        }
        setLoading(false);
    };

    const scorePercent = Math.round(score * 100);

    return (
        <div className="vote-container">
            <button
                className={`vote-btn ${currentVote === 1 ? "active-up" : ""}`}
                onClick={() => handleVote(1)}
                disabled={!user || isSelf || loading}
                title={isSelf ? "Cannot vote on your own place" : "Upvote"}
                aria-label="Upvote"
            >
                <IconUp size={16} />
            </button>
            <span className="vote-score">{scorePercent}%</span>
            <button
                className={`vote-btn ${currentVote === -1 ? "active-down" : ""}`}
                onClick={() => handleVote(-1)}
                disabled={!user || isSelf || loading}
                title={isSelf ? "Cannot vote on your own place" : "Downvote"}
                aria-label="Downvote"
            >
                <IconDown size={16} />
            </button>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                {upvotes} up · {downvotes} down
            </span>
        </div>
    );
}
