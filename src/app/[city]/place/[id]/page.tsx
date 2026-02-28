import Image from "next/image";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import mongoose from "mongoose";
import VoteButtons from "@/components/VoteButtons";
import CommentSection from "@/components/CommentSection";
import ReportButton from "@/components/ReportButton";
import { IconCheck, IconClock, IconCompass, IconStar, IconStarOutline } from "@/components/Icons";
import { getScoreLabel, getScorePercentage } from "@/lib/ranking";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Place from "@/models/Place";
import Vote from "@/models/Vote";
import Comment from "@/models/Comment";
import SavedPlace from "@/models/SavedPlace";
import VisitConfirmation from "@/models/VisitConfirmation";
import { IMAGE_BLUR_PLACEHOLDER, optimizeCloudinaryUrl } from "@/lib/image";
import { absoluteUrl } from "@/lib/site";

interface PlaceDetailPageProps {
    params: Promise<{ city: string; id: string }>;
}

interface PlaceSeoData {
    _id: unknown;
    name: string;
    city: string;
    description: string;
    category: string;
    image_urls: string[];
    status: string;
    location?: { coordinates: [number, number] };
}

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
    created_at: Date | string;
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

async function getPlaceForSeo(id: string): Promise<PlaceSeoData | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    await connectDB();
    return Place.findById(id)
        .select("name city description category image_urls status location")
        .lean<PlaceSeoData | null>();
}

export async function generateMetadata({ params }: PlaceDetailPageProps): Promise<Metadata> {
    const { city, id } = await params;
    const place = await getPlaceForSeo(id);
    const canonical = absoluteUrl(`/${city}/place/${id}`);

    if (!place || place.status !== "approved") {
        return {
            title: "Place Not Found - WhereToKolkata",
            alternates: { canonical },
        };
    }

    return {
        title: `${place.name} - ${place.city} | WhereToKolkata`,
        description: place.description.slice(0, 160),
        alternates: { canonical },
        openGraph: {
            title: place.name,
            description: place.description.slice(0, 160),
            url: canonical,
            type: "article",
            images: [{ url: absoluteUrl(`/${city}/place/${id}/opengraph-image`) }],
        },
        twitter: {
            card: "summary_large_image",
            title: place.name,
            description: place.description.slice(0, 160),
            images: [absoluteUrl(`/${city}/place/${id}/opengraph-image`)],
        },
    };
}

function NotFoundState({ message }: { message: string }) {
    return (
        <div className="page">
            <div className="content-container">
                <div className="empty-state">
                    <div className="empty-state-icon"><IconCompass size={48} color="var(--text-muted)" /></div>
                    <p className="empty-state-title">{message}</p>
                </div>
            </div>
        </div>
    );
}

async function toggleSavedPlace(placeId: string, city: string) {
    "use server";

    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }

    await connectDB();

    const existing = await SavedPlace.findOne({ user_id: user.userId, place_id: placeId }).select("_id").lean();
    if (existing) {
        await SavedPlace.deleteOne({ _id: existing._id });
    } else {
        await SavedPlace.create({ user_id: user.userId, place_id: placeId });
    }

    revalidatePath(`/${city}/place/${placeId}`);
    revalidatePath("/profile");
}

async function verifyVisit(placeId: string, city: string) {
    "use server";

    const user = await getCurrentUser();
    if (!user) {
        redirect("/login");
    }

    await connectDB();

    const existing = await VisitConfirmation.findOne({ user_id: user.userId, place_id: placeId }).select("_id").lean();
    if (existing) {
        return;
    }

    await VisitConfirmation.create({ user_id: user.userId, place_id: placeId });
    await Place.findByIdAndUpdate(placeId, {
        $inc: { visit_confirmations: 1 },
        $set: { last_verified_at: new Date() },
    });

    revalidatePath(`/${city}/place/${placeId}`);
}

export default async function PlaceDetailPage({ params }: PlaceDetailPageProps) {
    const { id, city } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return <NotFoundState message="Invalid place ID." />;
    }

    await connectDB();

    const placeDoc = await Place.findById(id)
        .select("name city description category tags best_time image_urls upvotes downvotes score status visit_confirmations created_by created_at location")
        .populate("created_by", "username")
        .lean<{
            _id: unknown;
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
            location?: { coordinates: [number, number] };
            created_by?: { _id: unknown; username: string };
            created_at: Date | string;
        } | null>();

    if (!placeDoc || placeDoc.status !== "approved") {
        return <NotFoundState message="Place not found." />;
    }

    const place: PlaceData = {
        _id: String(placeDoc._id),
        name: placeDoc.name,
        city: placeDoc.city,
        description: placeDoc.description,
        category: placeDoc.category,
        tags: placeDoc.tags || [],
        best_time: placeDoc.best_time || "",
        image_urls: placeDoc.image_urls || [],
        upvotes: placeDoc.upvotes || 0,
        downvotes: placeDoc.downvotes || 0,
        score: placeDoc.score || 0,
        status: placeDoc.status,
        visit_confirmations: placeDoc.visit_confirmations || 0,
        created_by: {
            _id: String(placeDoc.created_by?._id || ""),
            username: placeDoc.created_by?.username || "Unknown",
        },
        created_at: placeDoc.created_at,
    };

    const user = await getCurrentUser();
    const [initialCommentsRaw, userState] = await Promise.all([
        Comment.find({ place_id: id, $or: [{ status: "active" }, { status: { $exists: false } }] })
            .sort({ upvotes: -1, created_at: -1 })
            .limit(20)
            .select("username text upvotes created_at")
            .lean<{
                _id: unknown;
                username: string;
                text: string;
                upvotes: number;
                created_at: string | Date;
            }[]>(),
        user
            ? Promise.all([
                Vote.findOne({ user_id: user.userId, place_id: id }).select("vote").lean<{ vote: 1 | -1 } | null>(),
                SavedPlace.findOne({ user_id: user.userId, place_id: id }).select("_id").lean(),
                VisitConfirmation.findOne({ user_id: user.userId, place_id: id }).select("_id").lean(),
            ])
            : Promise.resolve([null, null, null]),
    ]);

    const initialComments = initialCommentsRaw.map((comment) => ({
        _id: String(comment._id),
        username: comment.username,
        text: comment.text,
        upvotes: comment.upvotes,
        created_at: comment.created_at,
    }));

    const [userVoteDoc, savedDoc, verifiedDoc] = userState;
    const scorePercent = getScorePercentage(place.score);
    const scoreLabel = getScoreLabel(place.score);
    const heroImage = place.image_urls[0] ? optimizeCloudinaryUrl(place.image_urls[0], 1200) : null;
    const galleryImages = place.image_urls.slice(1).map((url) => optimizeCloudinaryUrl(url, 600));
    const schemaJson: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Place",
        name: place.name,
        description: place.description,
        image: place.image_urls.map((url) => optimizeCloudinaryUrl(url, 1200)),
        url: absoluteUrl(`/${city}/place/${place._id}`),
        address: {
            "@type": "PostalAddress",
            addressLocality: place.city,
            addressCountry: "IN",
        },
    };

    if (placeDoc.location?.coordinates) {
        schemaJson.geo = {
            "@type": "GeoCoordinates",
            latitude: placeDoc.location.coordinates[1],
            longitude: placeDoc.location.coordinates[0],
        };
    }

    return (
        <div className="page" style={{ paddingBottom: "calc(var(--mobile-nav-height) + var(--space-12))" }}>
            <div className="content-container">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }}
                />

                {heroImage && (
                    <div className="place-hero-box">
                        <Image
                            src={heroImage}
                            alt={place.name}
                            className="place-hero-image"
                            fill
                            sizes="(max-width: 768px) 100vw, 720px"
                            priority
                            placeholder="blur"
                            blurDataURL={IMAGE_BLUR_PLACEHOLDER}
                        />
                    </div>
                )}

                <div className="place-info">
                    <div style={{ marginBottom: "var(--space-3)" }}>
                        <span className={`badge ${categoryClass[place.category] || ""}`}>{place.category}</span>
                    </div>

                    <h1 className="place-name">{place.name}</h1>

                    <div className="place-score-row">
                        <span className="badge badge-score" style={{ fontSize: "var(--font-size-sm)", padding: "var(--space-1) var(--space-3)" }}>
                            {scorePercent > 0 ? `${scorePercent}% Recommended` : "No votes yet"}
                        </span>
                        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)" }}>
                            {scoreLabel}
                        </span>
                    </div>

                    {place.visit_confirmations > 0 && (
                        <div className="place-verification" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <IconCheck size={16} color="var(--success)" /> Verified by {place.visit_confirmations} visitor{place.visit_confirmations !== 1 ? "s" : ""}
                        </div>
                    )}

                    {place.tags.length > 0 && (
                        <div className="place-tags" style={{ marginTop: "var(--space-3)" }}>
                            {place.tags.map((tag) => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    {place.best_time && (
                        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", marginTop: "var(--space-2)", display: "flex", alignItems: "center", gap: "4px" }}>
                            <IconClock size={14} /> Best time: {place.best_time}
                        </p>
                    )}

                    <p className="place-description" style={{ marginTop: "var(--space-4)" }}>{place.description}</p>

                    {galleryImages.length > 0 && (
                        <div className="place-gallery">
                            {galleryImages.map((url, index) => (
                                <div key={`${url}-${index}`} className="place-gallery-item">
                                    <Image
                                        src={url}
                                        alt={`${place.name} ${index + 2}`}
                                        className="place-gallery-image"
                                        fill
                                        sizes="(max-width: 640px) 50vw, 160px"
                                        loading="lazy"
                                        placeholder="blur"
                                        blurDataURL={IMAGE_BLUR_PLACEHOLDER}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="place-actions">
                        <VoteButtons
                            placeId={place._id}
                            initialUpvotes={place.upvotes}
                            initialDownvotes={place.downvotes}
                            initialScore={place.score}
                            createdBy={place.created_by._id}
                            userVote={userVoteDoc?.vote || null}
                        />

                        {user && (
                            <form action={toggleSavedPlace.bind(null, place._id, city)}>
                                <button
                                    className={`btn ${savedDoc ? "btn-primary" : "btn-secondary"} btn-sm`}
                                    type="submit"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                                >
                                    {savedDoc ? <IconStar size={14} /> : <IconStarOutline size={14} />}
                                    {savedDoc ? "Saved" : "Save"}
                                </button>
                            </form>
                        )}

                        {user && (
                            <form action={verifyVisit.bind(null, place._id, city)}>
                                <button
                                    className={`btn ${verifiedDoc ? "btn-primary" : "btn-secondary"} btn-sm`}
                                    type="submit"
                                    disabled={Boolean(verifiedDoc)}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                                >
                                    <IconCheck size={14} />
                                    {verifiedDoc ? "Verified" : "I visited recently"}
                                    {place.visit_confirmations > 0 ? ` (${place.visit_confirmations})` : ""}
                                </button>
                            </form>
                        )}

                        <ReportButton targetType="place" targetId={place._id} />
                    </div>

                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginBottom: "var(--space-6)" }}>
                        Added by <strong>{place.created_by.username}</strong> - {new Date(place.created_at).toLocaleDateString()}
                    </p>

                    <CommentSection placeId={place._id} initialComments={initialComments} initialSort="helpful" />
                </div>
            </div>
        </div>
    );
}
