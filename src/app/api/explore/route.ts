import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Place from "@/models/Place";
import Comment from "@/models/Comment";

const FEED_LIMIT = 8;

interface FeedPlace {
    _id: unknown;
    name: string;
    category: string;
    score: number;
    image_urls?: string[];
    tags?: string[];
    city: string;
    visit_confirmations?: number;
    upvotes?: number;
    downvotes?: number;
    commentCount?: number;
}

function toFeedItem(place: FeedPlace) {
    return {
        _id: String(place._id),
        name: place.name,
        category: place.category,
        score: place.score,
        image_url: place.image_urls?.[0] || null,
        tags: (place.tags || []).slice(0, 3),
        city: place.city,
        visit_confirmations: place.visit_confirmations || 0,
        upvotes: place.upvotes || 0,
        downvotes: place.downvotes || 0,
        commentCount: place.commentCount || 0,
    };
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const params = req.nextUrl.searchParams;
        const city = params.get("city") || "kolkata";

        const baseFilter = { city, status: "approved" };

        const [trendingRaw, recentRaw, hiddenGemsRaw, activeDiscussionsRaw] = await Promise.all([
            // Trending: highest score
            Place.find(baseFilter)
                .sort({ score: -1, upvotes: -1 })
                .limit(FEED_LIMIT)
                .select("name category score image_urls tags city visit_confirmations upvotes downvotes")
                .lean<FeedPlace[]>(),

            // Recently Added
            Place.find(baseFilter)
                .sort({ created_at: -1 })
                .limit(FEED_LIMIT)
                .select("name category score image_urls tags city created_at upvotes downvotes")
                .lean<FeedPlace[]>(),

            // Hidden Gems: high score, low vote count
            Place.find({
                ...baseFilter,
                score: { $gte: 0.8 },
                $expr: { $lte: [{ $add: ["$upvotes", "$downvotes"] }, 10] },
            })
                .sort({ score: -1 })
                .limit(FEED_LIMIT)
                .select("name category score image_urls tags city upvotes downvotes")
                .lean<FeedPlace[]>(),

            // Active Discussions: most recent comments
            Comment.aggregate<FeedPlace>([
                { $match: { $or: [{ status: "active" }, { status: { $exists: false } }] } },
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
                        image_urls: "$place.image_urls",
                        tags: "$place.tags",
                        city: "$place.city",
                        upvotes: "$place.upvotes",
                        downvotes: "$place.downvotes",
                        visit_confirmations: "$place.visit_confirmations",
                        commentCount: 1,
                    },
                },
            ]),
        ]);

        const trending = trendingRaw.map(toFeedItem);
        const recent = recentRaw.map(toFeedItem);
        const hiddenGems = hiddenGemsRaw.map(toFeedItem);
        const activeDiscussions = activeDiscussionsRaw.map(toFeedItem);

        const res = NextResponse.json({ trending, recent, hiddenGems, activeDiscussions });
        res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
        return res;
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
