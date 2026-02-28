import Link from "next/link";
import Image from "next/image";
import { IconTrending, IconCheck } from "@/components/Icons";
import { connectDB } from "@/lib/db";
import Place from "@/models/Place";
import { IMAGE_BLUR_PLACEHOLDER, optimizeCloudinaryUrl } from "@/lib/image";

interface TrendingPlace {
    _id: { toString(): string } | string;
    name: string;
    score: number;
    visit_confirmations: number;
    image_urls?: string[];
    image_url?: string | null;
    city: string;
}

interface TrendingSidebarProps {
    city: string;
    limit?: number;
}

async function getTrendingPlaces(city: string, limit: number): Promise<TrendingPlace[]> {
    await connectDB();
    return Place.find({ city, status: "approved" })
        .sort({ score: -1, visit_confirmations: -1, created_at: -1 })
        .limit(limit)
        .select("name score visit_confirmations image_urls city")
        .lean<TrendingPlace[]>();
}

export default async function TrendingSidebar({ city, limit = 10 }: TrendingSidebarProps) {
    const places = await getTrendingPlaces(city, limit);
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
                    const placeId = typeof place._id === "string" ? place._id : place._id.toString();
                    const imageSrc = place.image_url || place.image_urls?.[0] || null;
                    const optimizedSrc = imageSrc ? optimizeCloudinaryUrl(imageSrc, 600) : null;

                    return (
                        <Link
                            key={placeId}
                            href={`/${city}/place/${placeId}`}
                            prefetch
                            className="trending-item"
                        >
                            <span className="trending-rank">{index + 1}</span>
                            {optimizedSrc ? (
                                <Image
                                    src={optimizedSrc}
                                    alt={place.name}
                                    className="trending-thumb"
                                    width={44}
                                    height={44}
                                    sizes="44px"
                                    loading="lazy"
                                    placeholder="blur"
                                    blurDataURL={IMAGE_BLUR_PLACEHOLDER}
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
