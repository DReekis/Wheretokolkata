import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Place from "@/models/Place";
import Comment from "@/models/Comment";

const FEED_LIMIT = 8;

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const params = req.nextUrl.searchParams;
        const city = params.get("city") || "kolkata";

        const baseFilter = { city, status: "approved" };

        const [trending, recent, hiddenGems, activeDiscussions] = await Promise.all([
            // Trending: highest score
            Place.find(baseFilter)
                .sort({ score: -1, upvotes: -1 })
                .limit(FEED_LIMIT)
                .select("name category score image_urls tags city visit_confirmations")
                .lean(),

            // Recently Added
            Place.find(baseFilter)
                .sort({ created_at: -1 })
                .limit(FEED_LIMIT)
                .select("name category score image_urls tags city created_at")
                .lean(),

            // Hidden Gems: high score, low vote count
            Place.find({
                ...baseFilter,
                score: { $gte: 0.8 },
                $expr: { $lte: [{ $add: ["$upvotes", "$downvotes"] }, 10] },
            })
                .sort({ score: -1 })
                .limit(FEED_LIMIT)
                .select("name category score image_urls tags city")
                .lean(),

            // Active Discussions: most recent comments
            Comment.aggregate([
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
                        commentCount: 1,
                    },
                },
            ]),
        ]);

        return NextResponse.json({ trending, recent, hiddenGems, activeDiscussions });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
