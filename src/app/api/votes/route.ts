import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateScore } from "@/lib/ranking";
import { rateLimit } from "@/lib/rateLimit";
import Place from "@/models/Place";
import Vote from "@/models/Vote";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Login required." }, { status: 401 });
        }

        const rl = await rateLimit(`vote:${user.userId}`, 30, 60_000);
        if (!rl.success) {
            return NextResponse.json({ error: "Too many votes. Slow down." }, { status: 429 });
        }

        const body = await req.json();
        const { place_id, vote } = body;

        if (!place_id || ![1, -1].includes(vote)) {
            return NextResponse.json({ error: "Invalid vote." }, { status: 400 });
        }

        await connectDB();

        const place = await Place.findById(place_id)
            .select("created_by")
            .lean<{ created_by: { toString(): string } } | null>();

        if (!place) {
            return NextResponse.json({ error: "Place not found." }, { status: 404 });
        }

        if (place.created_by.toString() === user.userId) {
            return NextResponse.json({ error: "Cannot vote on your own place." }, { status: 403 });
        }

        const existing = await Vote.findOne({ user_id: user.userId, place_id })
            .select("vote")
            .lean<{ vote: 1 | -1 } | null>();

        if (existing?.vote === vote) {
            return NextResponse.json({ error: "Already voted." }, { status: 409 });
        }

        let upDelta = 0;
        let downDelta = 0;

        if (existing) {
            await Vote.updateOne({ user_id: user.userId, place_id }, { $set: { vote } });
            if (existing.vote === 1 && vote === -1) {
                upDelta = -1;
                downDelta = 1;
            } else if (existing.vote === -1 && vote === 1) {
                upDelta = 1;
                downDelta = -1;
            }
        } else {
            await Vote.create({ user_id: user.userId, place_id, vote });
            if (vote === 1) upDelta = 1;
            if (vote === -1) downDelta = 1;
        }

        const updated = await Place.findByIdAndUpdate(
            place_id,
            { $inc: { upvotes: upDelta, downvotes: downDelta } },
            { new: true }
        )
            .select("upvotes downvotes")
            .lean<{ upvotes: number; downvotes: number } | null>();

        if (!updated) {
            return NextResponse.json({ error: "Place not found." }, { status: 404 });
        }

        const score = calculateScore(updated.upvotes, updated.downvotes);
        await Place.updateOne({ _id: place_id }, { $set: { score } });

        return NextResponse.json({
            ok: true,
            score,
            upvotes: updated.upvotes,
            downvotes: updated.downvotes,
        });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
