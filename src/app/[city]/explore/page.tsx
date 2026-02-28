import { Suspense, type ReactNode } from "react";
import PlaceCard from "@/components/PlaceCard";
import TrendingSidebar from "@/components/TrendingSidebar";
import { IconTrending, IconRecent, IconGem, IconChat, IconCompass } from "@/components/Icons";
import { connectDB } from "@/lib/db";
import Place from "@/models/Place";
import Comment from "@/models/Comment";

interface ExplorePageProps {
    params: Promise<{ city: string }>;
}

interface ExplorePlace {
    _id: string;
    name: string;
    category: string;
    score: number;
    image_url?: string | null;
    tags?: string[];
    city: string;
    visit_confirmations?: number;
    upvotes?: number;
    downvotes?: number;
    commentCount?: number;
}

const FEED_LIMIT = 8;

function toPlaceCardData(item: {
    _id: unknown;
    name: string;
    category: string;
    score: number;
    image_urls?: string[];
    image_url?: string | null;
    tags?: string[];
    city: string;
    visit_confirmations?: number;
    upvotes?: number;
    downvotes?: number;
    commentCount?: number;
}): ExplorePlace {
    return {
        _id: String(item._id),
        name: item.name,
        category: item.category,
        score: item.score,
        image_url: item.image_url || item.image_urls?.[0] || null,
        tags: item.tags?.slice(0, 3) || [],
        city: item.city,
        visit_confirmations: item.visit_confirmations || 0,
        upvotes: item.upvotes || 0,
        downvotes: item.downvotes || 0,
        commentCount: item.commentCount || 0,
    };
}

async function getTrending(city: string): Promise<ExplorePlace[]> {
    await connectDB();
    const places = await Place.find({ city, status: "approved" })
        .sort({ score: -1, upvotes: -1 })
        .limit(FEED_LIMIT)
        .select("name category score image_urls tags city visit_confirmations upvotes downvotes")
        .lean<{
            _id: unknown;
            name: string;
            category: string;
            score: number;
            image_urls: string[];
            tags: string[];
            city: string;
            visit_confirmations: number;
            upvotes: number;
            downvotes: number;
        }[]>();

    return places.map(toPlaceCardData);
}

async function getRecent(city: string): Promise<ExplorePlace[]> {
    await connectDB();
    const places = await Place.find({ city, status: "approved" })
        .sort({ created_at: -1 })
        .limit(FEED_LIMIT)
        .select("name category score image_urls tags city upvotes downvotes")
        .lean<{
            _id: unknown;
            name: string;
            category: string;
            score: number;
            image_urls: string[];
            tags: string[];
            city: string;
            upvotes: number;
            downvotes: number;
        }[]>();

    return places.map(toPlaceCardData);
}

async function getHiddenGems(city: string): Promise<ExplorePlace[]> {
    await connectDB();
    const places = await Place.find({
        city,
        status: "approved",
        score: { $gte: 0.8 },
        $expr: { $lte: [{ $add: ["$upvotes", "$downvotes"] }, 10] },
    })
        .sort({ score: -1 })
        .limit(FEED_LIMIT)
        .select("name category score image_urls tags city upvotes downvotes")
        .lean<{
            _id: unknown;
            name: string;
            category: string;
            score: number;
            image_urls: string[];
            tags: string[];
            city: string;
            upvotes: number;
            downvotes: number;
        }[]>();

    return places.map(toPlaceCardData);
}

async function getActiveDiscussions(city: string): Promise<ExplorePlace[]> {
    await connectDB();

    const discussions = await Comment.aggregate<{
        _id: unknown;
        name: string;
        category: string;
        score: number;
        image_url: string | null;
        city: string;
        tags: string[];
        upvotes: number;
        downvotes: number;
        visit_confirmations: number;
        commentCount: number;
    }>([
        {
            $group: {
                _id: "$place_id",
                commentCount: { $sum: 1 },
                lastComment: { $max: "$created_at" },
            },
        },
        { $sort: { lastComment: -1 } },
        { $limit: FEED_LIMIT },
        {
            $lookup: {
                from: "places",
                localField: "_id",
                foreignField: "_id",
                as: "place",
            },
        },
        { $unwind: "$place" },
        { $match: { "place.city": city, "place.status": "approved" } },
        {
            $project: {
                _id: "$place._id",
                name: "$place.name",
                category: "$place.category",
                score: "$place.score",
                image_url: { $arrayElemAt: ["$place.image_urls", 0] },
                city: "$place.city",
                tags: { $slice: ["$place.tags", 3] },
                upvotes: "$place.upvotes",
                downvotes: "$place.downvotes",
                visit_confirmations: "$place.visit_confirmations",
                commentCount: 1,
            },
        },
    ]);

    return discussions.map(toPlaceCardData);
}

function ExploreSectionSkeleton({ title }: { title: string }) {
    return (
        <div className="section">
            <h2 className="section-title">
                <span className="section-icon">
                    <div className="skeleton" style={{ width: 20, height: 20, borderRadius: "50%" }} />
                </span>
                {title}
            </h2>
            <div className="section-grid">
                {Array.from({ length: 3 }).map((_, cardIndex) => (
                    <div key={cardIndex} className="card" style={{ overflow: "hidden" }}>
                        <div className="skeleton" style={{ width: "100%", aspectRatio: "16/10" }} />
                        <div style={{ padding: "12px 16px" }}>
                            <div className="skeleton" style={{ width: "60px", height: "20px", borderRadius: "999px", marginBottom: "8px" }} />
                            <div className="skeleton" style={{ width: "70%", height: "18px", marginBottom: "6px" }} />
                            <div className="skeleton" style={{ width: "40%", height: "14px" }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TrendingSidebarSkeleton() {
    return (
        <div className="trending-sidebar">
            <div className="trending-header">
                <div className="skeleton" style={{ width: "140px", height: "20px" }} />
            </div>
            <div className="trending-list">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="trending-item-skeleton">
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

async function ExploreSection({
    title,
    icon,
    city,
    placesPromise,
    prioritizeFirstImage = false,
}: {
    title: string;
    icon: ReactNode;
    city: string;
    placesPromise: Promise<ExplorePlace[]>;
    prioritizeFirstImage?: boolean;
}) {
    const places = await placesPromise;
    if (places.length === 0) return null;

    return (
        <div className="section">
            <h2 className="section-title">
                <span className="section-icon">{icon}</span>
                {title}
            </h2>
            <div className="section-grid">
                {places.map((place, index) => (
                    <PlaceCard
                        key={place._id}
                        _id={place._id}
                        name={place.name}
                        category={place.category}
                        score={place.score}
                        image_url={place.image_url}
                        tags={place.tags}
                        city={city}
                        visit_confirmations={place.visit_confirmations}
                        upvotes={place.upvotes}
                        downvotes={place.downvotes}
                        priority={prioritizeFirstImage && index === 0}
                    />
                ))}
            </div>
        </div>
    );
}

async function ExploreEmptyState({
    cityName,
    sections,
}: {
    cityName: string;
    sections: Promise<ExplorePlace[]>[];
}) {
    const allSections = await Promise.all(sections);
    const hasItems = allSections.some((items) => items.length > 0);
    if (hasItems) return null;

    return (
        <div className="empty-state">
            <div className="empty-state-icon"><IconCompass size={48} color="var(--text-muted)" /></div>
            <p className="empty-state-title">No places yet</p>
            <p>Be the first to add a special place in {cityName}!</p>
        </div>
    );
}

export default async function ExplorePage({ params }: ExplorePageProps) {
    const { city } = await params;
    const cityName = city.charAt(0).toUpperCase() + city.slice(1);

    const trendingPromise = getTrending(city);
    const recentPromise = getRecent(city);
    const hiddenGemsPromise = getHiddenGems(city);
    const activeDiscussionsPromise = getActiveDiscussions(city);

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Explore {cityName}</h1>
                    <p className="page-subtitle">Discover places the community loves</p>
                </div>

                <div className="explore-layout">
                    <div className="explore-main">
                        <Suspense fallback={<ExploreSectionSkeleton title="Trending Places" />}>
                            <ExploreSection
                                title="Trending Places"
                                icon={<IconTrending size={20} color="var(--danger)" />}
                                city={city}
                                placesPromise={trendingPromise}
                                prioritizeFirstImage
                            />
                        </Suspense>

                        <Suspense fallback={<ExploreSectionSkeleton title="Recently Added" />}>
                            <ExploreSection
                                title="Recently Added"
                                icon={<IconRecent size={20} color="var(--accent)" />}
                                city={city}
                                placesPromise={recentPromise}
                            />
                        </Suspense>

                        <Suspense fallback={<ExploreSectionSkeleton title="Hidden Gems" />}>
                            <ExploreSection
                                title="Hidden Gems"
                                icon={<IconGem size={20} color="var(--cat-hidden)" />}
                                city={city}
                                placesPromise={hiddenGemsPromise}
                            />
                        </Suspense>

                        <Suspense fallback={<ExploreSectionSkeleton title="Active Discussions" />}>
                            <ExploreSection
                                title="Active Discussions"
                                icon={<IconChat size={20} color="var(--cat-culture)" />}
                                city={city}
                                placesPromise={activeDiscussionsPromise}
                            />
                        </Suspense>

                        <Suspense fallback={null}>
                            <ExploreEmptyState
                                cityName={cityName}
                                sections={[trendingPromise, recentPromise, hiddenGemsPromise, activeDiscussionsPromise]}
                            />
                        </Suspense>
                    </div>

                    <aside className="explore-sidebar">
                        <Suspense fallback={<TrendingSidebarSkeleton />}>
                            <TrendingSidebar city={city} />
                        </Suspense>
                    </aside>
                </div>
            </div>
        </div>
    );
}
