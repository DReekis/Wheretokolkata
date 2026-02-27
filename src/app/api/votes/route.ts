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

        const place = await Place.findById(place_id);
        if (!place) {
            return NextResponse.json({ error: "Place not found." }, { status: 404 });
        }

        // Prevent self-voting
        if (place.created_by.toString() === user.userId) {
            return NextResponse.json({ error: "Cannot vote on your own place." }, { status: 403 });
        }

        const existing = await Vote.findOne({ user_id: user.userId, place_id });

        if (existing) {
            if (existing.vote === vote) {
                return NextResponse.json({ error: "Already voted." }, { status: 409 });
            }
            // Change vote
            const oldVote = existing.vote;
            existing.vote = vote;
            await existing.save();

            const upDelta = vote === 1 ? 1 : -1;
            const downDelta = oldVote === -1 ? -1 : 1;

            await Place.findByIdAndUpdate(place_id, {
                $inc: { upvotes: upDelta, downvotes: vote === -1 ? 1 : -1 },
            });
        } else {
            await Vote.create({ user_id: user.userId, place_id, vote });
            await Place.findByIdAndUpdate(place_id, {
                $inc: vote === 1 ? { upvotes: 1 } : { downvotes: 1 },
            });
        }

        // Recalculate score
        const updated = await Place.findById(place_id);
        if (updated) {
            updated.score = calculateScore(updated.upvotes, updated.downvotes);
            await updated.save();
        }

        return NextResponse.json({ ok: true, score: updated?.score, upvotes: updated?.upvotes, downvotes: updated?.downvotes });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
