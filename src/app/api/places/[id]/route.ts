import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Place from "@/models/Place";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const place = await Place.findById(id).populate("created_by", "username").lean();
        if (!place || place.status === "removed") {
            return NextResponse.json({ error: "Place not found." }, { status: 404 });
        }

        return NextResponse.json({ place });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
