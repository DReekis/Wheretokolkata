import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import Place from "@/models/Place";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate ObjectId format to avoid Mongoose cast errors
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid place ID." }, { status: 400 });
        }

        await connectDB();

        const place = await Place.findById(id).populate("created_by", "username").lean();
        if (!place || place.status === "removed") {
            return NextResponse.json({ error: "Place not found." }, { status: 404 });
        }

        const res = NextResponse.json({ place });
        res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
        return res;
    } catch (err) {
        console.error("[PLACE_DETAIL_ERROR]", err);
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
