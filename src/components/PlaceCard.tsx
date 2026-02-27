import Link from "next/link";

interface PlaceCardProps {
    _id: string;
    name: string;
    category: string;
    score: number;
    image_urls?: string[];
    tags?: string[];
    city?: string;
    visit_confirmations?: number;
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

export default function PlaceCard({ _id, name, category, score, image_urls, tags, city = "kolkata", visit_confirmations }: PlaceCardProps) {
    const scorePercent = Math.round(score * 100);

    return (
        <Link href={`/${city}/place/${_id}`} className="card place-card">
            {image_urls?.[0] && (
                <img
                    src={image_urls[0]}
                    alt={name}
                    className="place-card-image"
                    loading="lazy"
                />
            )}
            <div className="place-card-content">
                <div className="place-card-meta">
                    <span className={`badge ${categoryClass[category] || ""}`}>{category}</span>
                    {scorePercent > 0 && <span className="badge badge-score">{scorePercent}%</span>}
                </div>
                <h3 className="place-card-name">{name}</h3>
                {visit_confirmations && visit_confirmations > 0 ? (
                    <p className="place-card-desc" style={{ color: "var(--success)", fontSize: "var(--font-size-xs)" }}>
                        ✔ Verified by {visit_confirmations} visitor{visit_confirmations !== 1 ? "s" : ""}
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
