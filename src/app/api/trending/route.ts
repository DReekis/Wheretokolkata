import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Place from "@/models/Place";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const params = req.nextUrl.searchParams;
        const city = params.get("city") || "kolkata";
        const limit = Math.min(parseInt(params.get("limit") || "10", 10) || 10, 20);

        const trendingRaw = await Place.find({ city, status: "approved" })
            .sort({ score: -1, visit_confirmations: -1, created_at: -1 })
            .limit(limit)
            .select("name score visit_confirmations image_urls city")
            .lean<{
                _id: unknown;
                name: string;
                score: number;
                visit_confirmations: number;
                image_urls?: string[];
                city: string;
            }[]>();

        const trending = trendingRaw.map((place) => ({
            _id: String(place._id),
            name: place.name,
            score: place.score,
            visit_confirmations: place.visit_confirmations || 0,
            image_url: place.image_urls?.[0] || null,
            city: place.city,
        }));

        const res = NextResponse.json(trending);
        res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
        return res;
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
