import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Place from "@/models/Place";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const params = req.nextUrl.searchParams;
        const city = params.get("city") || "kolkata";
        const limit = Math.min(parseInt(params.get("limit") || "10", 10) || 10, 20);

        const trending = await Place.find({ city, status: "approved" })
            .sort({ score: -1, visit_confirmations: -1, created_at: -1 })
            .limit(limit)
            .select("name score visit_confirmations image_urls city")
            .lean();

        const res = NextResponse.json(trending);
        res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
        return res;
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
