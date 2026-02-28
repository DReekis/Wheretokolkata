import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sanitize } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rateLimit";
import Comment from "@/models/Comment";
import Place from "@/models/Place";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const params = req.nextUrl.searchParams;
        const place_id = params.get("place_id");
        const sort = params.get("sort") || "helpful";
        const page = Math.max(1, parseInt(params.get("page") || "1"));
        const limit = 20;

        if (!place_id) {
            return NextResponse.json({ error: "place_id required." }, { status: 400 });
        }

        const sortObj: Record<string, 1 | -1> = sort === "recent" ? { created_at: -1 } : { upvotes: -1, created_at: -1 };
        const visibleFilter = {
            place_id,
            $or: [{ status: "active" }, { status: { $exists: false } }],
        };

        const [comments, total] = await Promise.all([
            Comment.find(visibleFilter)
                .sort(sortObj)
                .skip((page - 1) * limit)
                .limit(limit)
                .select("username text upvotes created_at")
                .lean(),
            Comment.countDocuments(visibleFilter),
        ]);

        return NextResponse.json({ comments, total, page, pages: Math.ceil(total / limit) });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Login required." }, { status: 401 });
        }

        const rl = await rateLimit(`comment:${user.userId}`, 10, 60_000);
        if (!rl.success) {
            return NextResponse.json({ error: "Too many comments. Slow down." }, { status: 429 });
        }

        const body = await req.json();
        const place_id = body.place_id;
        const text = sanitize(body.text || "");

        if (!place_id) {
            return NextResponse.json({ error: "place_id required." }, { status: 400 });
        }

        if (!text || text.length < 15) {
            return NextResponse.json({ error: "Comment must be at least 15 characters." }, { status: 400 });
        }

        if (text.length > 1000) {
            return NextResponse.json({ error: "Comment too long." }, { status: 400 });
        }

        await connectDB();

        const place = await Place.findById(place_id).select("status").lean<{ status: string } | null>();
        if (!place || place.status !== "approved") {
            return NextResponse.json({ error: "Place not available for comments." }, { status: 404 });
        }

        const comment = await Comment.create({
            place_id,
            user_id: user.userId,
            username: user.username,
            text,
        });

        return NextResponse.json({ comment }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
