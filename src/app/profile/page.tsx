"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import PlaceCard from "@/components/PlaceCard";

interface ProfileData {
    user: { username: string; karma: number; created_at: string };
    stats: { placesCount: number; commentsCount: number };
    places: Array<{ _id: string; name: string; city: string; category: string; score: number; image_urls: string[] }>;
    savedPlaces: Array<{ place_id: { _id: string; name: string; city: string; category: string; score: number; image_urls: string[] } }>;
}

export default function ProfilePage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/users/${user.username}`);
            const json = await res.json();
            setData(json);
        } catch {
            // silent
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }
        if (user) fetchProfile();
    }, [user, authLoading, router, fetchProfile]);

    const handleLogout = async () => {
        await logout();
        router.push("/kolkata/explore");
    };

    if (authLoading || loading) {
        return (
            <div className="page">
                <div className="content-container" style={{ textAlign: "center", padding: "var(--space-12)" }}>
                    <div className="spinner" style={{ margin: "0 auto" }} />
                </div>
            </div>
        );
    }

    if (!user || !data) return null;

    return (
        <div className="page">
            <div className="content-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {data.user.username.charAt(0).toUpperCase()}
                    </div>
                    <h1 className="profile-username">{data.user.username}</h1>
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
                        Member since {new Date(data.user.created_at).toLocaleDateString()}
                    </p>

                    <div className="profile-stats">
                        <div className="profile-stat">
                            <div className="profile-stat-value">{data.user.karma}</div>
                            <div className="profile-stat-label">Karma</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-value">{data.stats.placesCount}</div>
                            <div className="profile-stat-label">Places</div>
                        </div>
                        <div className="profile-stat">
                            <div className="profile-stat-value">{data.stats.commentsCount}</div>
                            <div className="profile-stat-label">Comments</div>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ marginTop: "var(--space-4)" }}>
                        Logout
                    </button>
                </div>

                {/* Places Added */}
                {data.places.length > 0 && (
                    <div className="section">
                        <h2 className="section-title">Your Places</h2>
                        <div className="section-grid">
                            {data.places.map((place) => (
                                <PlaceCard
                                    key={place._id}
                                    _id={place._id}
                                    name={place.name}
                                    category={place.category}
                                    score={place.score}
                                    image_urls={place.image_urls}
                                    city={place.city}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Saved Places */}
                {data.savedPlaces.length > 0 && (
                    <div className="section">
                        <h2 className="section-title">Saved Places</h2>
                        <div className="section-grid">
                            {data.savedPlaces.map((sp) => (
                                sp.place_id && (
                                    <PlaceCard
                                        key={sp.place_id._id}
                                        _id={sp.place_id._id}
                                        name={sp.place_id.name}
                                        category={sp.place_id.category}
                                        score={sp.place_id.score}
                                        image_urls={sp.place_id.image_urls}
                                        city={sp.place_id.city}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
