import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateScore } from "@/lib/ranking";
import { rateLimit } from "@/lib/rateLimit";
import Place from "@/models/Place";
import Vote from "@/models/Vote";
import mongoose from "mongoose";

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

        if (!place_id || !mongoose.Types.ObjectId.isValid(place_id) || ![1, -1].includes(vote)) {
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

        if (existing) {
            await Vote.updateOne({ user_id: user.userId, place_id }, { $set: { vote } });
        } else {
            await Vote.create({ user_id: user.userId, place_id, vote });
        }

        const [upvotes, downvotes] = await Promise.all([
            Vote.countDocuments({ place_id, vote: 1 }),
            Vote.countDocuments({ place_id, vote: -1 }),
        ]);

        const score = calculateScore(upvotes, downvotes);
        await Place.updateOne({ _id: place_id }, { $set: { upvotes, downvotes, score } });

        return NextResponse.json({
            ok: true,
            score,
            upvotes,
            downvotes,
        });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
