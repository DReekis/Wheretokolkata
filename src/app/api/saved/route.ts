import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import SavedPlace from "@/models/SavedPlace";
import "@/models/Place"; // Required for populate("place_id")

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Login required." }, { status: 401 });
        }

        await connectDB();

        const saved = await SavedPlace.find({ user_id: user.userId })
            .sort({ created_at: -1 })
            .populate("place_id", "name city category score image_urls")
            .lean();

        return NextResponse.json({ saved });
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

        const rl = await rateLimit(`save:${user.userId}`, 30, 60_000);
        if (!rl.success) {
            return NextResponse.json({ error: "Too many actions." }, { status: 429 });
        }

        const body = await req.json();
        const { place_id } = body;

        if (!place_id) {
            return NextResponse.json({ error: "place_id required." }, { status: 400 });
        }

        await connectDB();

        const existing = await SavedPlace.findOne({ user_id: user.userId, place_id }).select("_id").lean();
        if (existing) {
            await SavedPlace.deleteOne({ _id: existing._id });
            return NextResponse.json({ saved: false });
        }

        await SavedPlace.create({ user_id: user.userId, place_id });
        return NextResponse.json({ saved: true });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
