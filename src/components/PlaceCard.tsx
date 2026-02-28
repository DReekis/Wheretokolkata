import Link from "next/link";
import Image from "next/image";
import { IconCheck, IconUp, IconDown } from "@/components/Icons";
import { IMAGE_BLUR_PLACEHOLDER, optimizeCloudinaryUrl } from "@/lib/image";

interface PlaceCardProps {
    _id: string;
    name: string;
    category: string;
    score: number;
    image_url?: string | null;
    image_urls?: string[];
    tags?: string[];
    city?: string;
    visit_confirmations?: number;
    upvotes?: number;
    downvotes?: number;
    priority?: boolean;
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

export default function PlaceCard({
    _id,
    name,
    category,
    score,
    image_url,
    image_urls,
    tags,
    city = "kolkata",
    visit_confirmations,
    upvotes,
    downvotes,
    priority = false,
}: PlaceCardProps) {
    const scorePercent = Math.round(score * 100);
    const totalVotes = (upvotes || 0) + (downvotes || 0);
    const imageSrc = image_url || image_urls?.[0] || null;
    const optimizedSrc = imageSrc ? optimizeCloudinaryUrl(imageSrc, 600) : null;

    return (
        <Link href={`/${city}/place/${_id}`} prefetch className="card place-card">
            {optimizedSrc && (
                <div className="place-card-image-wrap">
                    <Image
                        src={optimizedSrc}
                        alt={name}
                        className="place-card-image"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={priority}
                        loading={priority ? "eager" : "lazy"}
                        placeholder="blur"
                        blurDataURL={IMAGE_BLUR_PLACEHOLDER}
                    />
                </div>
            )}
            <div className="place-card-content">
                <div className="place-card-meta">
                    <span className={`badge ${categoryClass[category] || ""}`}>{category}</span>
                    {scorePercent > 0 && <span className="badge badge-score">{scorePercent}%</span>}
                </div>
                <h3 className="place-card-name">{name}</h3>
                {totalVotes > 0 && (
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", margin: "2px 0", display: "flex", alignItems: "center", gap: "4px" }}>
                        <IconUp size={12} /> {upvotes || 0} <IconDown size={12} /> {downvotes || 0}
                    </p>
                )}
                {visit_confirmations && visit_confirmations > 0 ? (
                    <p className="place-card-desc" style={{ color: "var(--success)", fontSize: "var(--font-size-xs)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <IconCheck size={12} color="var(--success)" /> Verified by {visit_confirmations} visitor{visit_confirmations !== 1 ? "s" : ""}
                    </p>
                ) : null}
                {tags && tags.length > 0 && (
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                        {tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="tag">{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
