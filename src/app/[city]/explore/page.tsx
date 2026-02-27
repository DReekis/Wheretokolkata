"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import PlaceCard from "@/components/PlaceCard";

interface Place {
    _id: string;
    name: string;
    category: string;
    score: number;
    image_urls: string[];
    tags: string[];
    city: string;
    visit_confirmations?: number;
    upvotes?: number;
    downvotes?: number;
    commentCount?: number;
}

interface FeedData {
    trending: Place[];
    recent: Place[];
    hiddenGems: Place[];
    activeDiscussions: Place[];
}

export default function ExplorePage() {
    const params = useParams();
    const city = (params.city as string) || "kolkata";
    const [data, setData] = useState<FeedData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchFeed = useCallback(async () => {
        try {
            const res = await fetch(`/api/explore?city=${city}`);
            const json = await res.json();
            setData(json);
        } catch {
            // silent
        }
        setLoading(false);
    }, [city]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    const cityName = city.charAt(0).toUpperCase() + city.slice(1);

    if (loading) {
        return (
            <div className="page">
                <div className="container">
                    <div style={{ textAlign: "center", padding: "var(--space-12)" }}>
                        <div className="spinner" style={{ margin: "0 auto" }} />
                    </div>
                </div>
            </div>
        );
    }

    const sections = [
        { title: "🔥 Trending Places", items: data?.trending },
        { title: "🆕 Recently Added", items: data?.recent },
        { title: "💎 Hidden Gems", items: data?.hiddenGems },
        { title: "💬 Active Discussions", items: data?.activeDiscussions },
    ];

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Explore {cityName}</h1>
                    <p className="page-subtitle">Discover places the community loves</p>
                </div>

                {sections.map((section) => {
                    if (!section.items || section.items.length === 0) return null;
                    return (
                        <div key={section.title} className="section">
                            <h2 className="section-title">{section.title}</h2>
                            <div className="section-grid">
                                {section.items.map((place) => (
                                    <PlaceCard
                                        key={place._id}
                                        _id={place._id}
                                        name={place.name}
                                        category={place.category}
                                        score={place.score}
                                        image_urls={place.image_urls}
                                        tags={place.tags}
                                        city={city}
                                        visit_confirmations={place.visit_confirmations}
                                        upvotes={place.upvotes}
                                        downvotes={place.downvotes}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {!data?.trending?.length && !data?.recent?.length && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🗺️</div>
                        <p className="empty-state-title">No places yet</p>
                        <p>Be the first to add a special place in {cityName}!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
