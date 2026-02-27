import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import Place from "@/models/Place";
import VisitConfirmation from "@/models/VisitConfirmation";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Login required." }, { status: 401 });
        }

        const rl = await rateLimit(`verify:${user.userId}`, 20, 60_000);
        if (!rl.success) {
            return NextResponse.json({ error: "Too many actions. Slow down." }, { status: 429 });
        }

        const { id } = await params;
        await connectDB();

        const place = await Place.findById(id);
        if (!place) {
            return NextResponse.json({ error: "Place not found." }, { status: 404 });
        }

        // Check existing confirmation
        const existing = await VisitConfirmation.findOne({ user_id: user.userId, place_id: id });
        if (existing) {
            return NextResponse.json({ error: "Already confirmed." }, { status: 409 });
        }

        await VisitConfirmation.create({ user_id: user.userId, place_id: id });

        await Place.findByIdAndUpdate(id, {
            $inc: { visit_confirmations: 1 },
            $set: { last_verified_at: new Date() },
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
