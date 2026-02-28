"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { IconUp } from "@/components/Icons";
import ReportButton from "@/components/ReportButton";

interface Comment {
    _id: string;
    username: string;
    text: string;
    upvotes: number;
    created_at: string | Date;
}

interface CommentSectionProps {
    placeId: string;
    initialComments?: Comment[];
    initialSort?: "helpful" | "recent";
}

export default function CommentSection({
    placeId,
    initialComments,
    initialSort = "helpful",
}: CommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>(initialComments || []);
    const [text, setText] = useState("");
    const [sort, setSort] = useState<"helpful" | "recent">(initialSort);
    const [loading, setLoading] = useState(!initialComments);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [skipFirstFetch, setSkipFirstFetch] = useState(Boolean(initialComments));

    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/comments?place_id=${placeId}&sort=${sort}`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch {
            // silent
        }
        setLoading(false);
    }, [placeId, sort]);

    useEffect(() => {
        if (skipFirstFetch) {
            setSkipFirstFetch(false);
            return;
        }
        fetchComments();
    }, [fetchComments, skipFirstFetch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || submitting) return;

        if (text.trim().length < 15) {
            setError("Comment must be at least 15 characters.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ place_id: placeId, text: text.trim() }),
            });
            if (res.ok) {
                setText("");
                fetchComments();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to post comment.");
            }
        } catch {
            setError("Something went wrong.");
        }
        setSubmitting(false);
    };

    const handleUpvote = async (commentId: string) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/comments/${commentId}/upvote`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setComments((prev) =>
                    prev.map((c) => (c._id === commentId ? { ...c, upvotes: data.upvotes } : c))
                );
            }
        } catch {
            // silent
        }
    };

    const timeAgo = (date: string | Date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                <h3 className="section-title" style={{ margin: 0 }}>Comments ({comments.length})</h3>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <button
                        className={`btn btn-sm ${sort === "helpful" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setSort("helpful")}
                    >
                        Helpful
                    </button>
                    <button
                        className={`btn btn-sm ${sort === "recent" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setSort("recent")}
                    >
                        Recent
                    </button>
                </div>
            </div>

            {user && (
                <form onSubmit={handleSubmit} style={{ marginBottom: "var(--space-6)" }}>
                    <textarea
                        className="form-textarea"
                        placeholder="Share your experience about this place (min 15 characters)..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={3}
                    />
                    {error && <p className="form-error" style={{ marginTop: "4px" }}>{error}</p>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-2)" }}>
                        <span className="form-hint">{text.length}/1000</span>
                        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                            {submitting ? "Posting..." : "Post Comment"}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div style={{ textAlign: "center", padding: "var(--space-8)" }}>
                    <div className="spinner" style={{ margin: "0 auto" }} />
                </div>
            ) : comments.length === 0 ? (
                <div className="empty-state">
                    <p className="empty-state-title">No comments yet</p>
                    <p>Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="comment-list">
                    {comments.map((comment) => (
                        <div key={comment._id} className="comment-item">
                            <div className="comment-header">
                                <span className="comment-author">{comment.username}</span>
                                <span className="comment-date">{timeAgo(comment.created_at)}</span>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                            <div className="comment-actions">
                                <button type="button" className="comment-action-btn" onClick={() => handleUpvote(comment._id)}>
                                    <IconUp size={12} /> {comment.upvotes > 0 ? comment.upvotes : ""}
                                </button>
                                <ReportButton targetType="comment" targetId={comment._id} compact />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
