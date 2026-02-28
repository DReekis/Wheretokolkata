"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconTrending, IconCheck } from "@/components/Icons";

interface TrendingPlace {
    _id: string;
    name: string;
    score: number;
    visit_confirmations: number;
    image_urls: string[];
    city: string;
}

interface TrendingSidebarProps {
    city: string;
}

function TrendingSkeleton() {
    return (
        <div className="trending-sidebar">
            <div className="trending-header">
                <div className="skeleton" style={{ width: "140px", height: "20px" }} />
            </div>
            <div className="trending-list">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="trending-item-skeleton">
                        <div className="skeleton trending-thumb" />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div className="skeleton" style={{ width: "75%", height: "14px" }} />
                            <div className="skeleton" style={{ width: "50%", height: "12px" }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function TrendingSidebar({ city }: TrendingSidebarProps) {
    const [places, setPlaces] = useState<TrendingPlace[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrending() {
            try {
                const res = await fetch(`/api/trending?city=${city}&limit=10`);
                if (res.ok) {
                    const data = await res.json();
                    setPlaces(data);
                }
            } catch {
                // silent
            }
            setLoading(false);
        }
        fetchTrending();
    }, [city]);

    if (loading) return <TrendingSkeleton />;
    if (places.length === 0) return null;

    return (
        <div className="trending-sidebar">
            <div className="trending-header">
                <IconTrending size={18} color="var(--danger)" />
                <h3 className="trending-title">Trending Places</h3>
            </div>
            <div className="trending-list">
                {places.map((place, index) => {
                    const scorePercent = Math.round(place.score * 100);
                    return (
                        <Link
                            key={place._id}
                            href={`/${city}/place/${place._id}`}
                            className="trending-item"
                        >
                            <span className="trending-rank">{index + 1}</span>
                            {place.image_urls?.[0] ? (
                                <img
                                    src={place.image_urls[0]}
                                    alt={place.name}
                                    className="trending-thumb"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="trending-thumb trending-thumb-placeholder" />
                            )}
                            <div className="trending-info">
                                <span className="trending-name">{place.name}</span>
                                <div className="trending-meta">
                                    {scorePercent > 0 && (
                                        <span className="badge badge-score" style={{ fontSize: "10px", padding: "2px 6px" }}>
                                            {scorePercent}%
                                        </span>
                                    )}
                                    {place.visit_confirmations > 0 && (
                                        <span className="trending-visits">
                                            <IconCheck size={11} color="var(--success)" />
                                            {place.visit_confirmations}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
