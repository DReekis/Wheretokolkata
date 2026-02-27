import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sanitize } from "@/lib/sanitize";
import { validateCoordinates, parseBoundingBox, buildGeoWithinQuery } from "@/lib/geo";
import { calculateScore } from "@/lib/ranking";
import { rateLimit } from "@/lib/rateLimit";
import Place, { CATEGORIES } from "@/models/Place";

const MAP_MARKER_LIMIT = 200;
const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const params = req.nextUrl.searchParams;
        const city = params.get("city") || "kolkata";
        const category = params.get("category");
        const page = Math.max(1, parseInt(params.get("page") || "1"));
        const mode = params.get("mode"); // "map" or "list"

        const query: Record<string, unknown> = { city, status: "approved" };

        if (category && CATEGORIES.includes(category as typeof CATEGORIES[number])) {
            query.category = category;
        }

        // Map mode: bounding box query, limited fields, max 200
        if (mode === "map") {
            const bbox = parseBoundingBox(params);
            if (!bbox) {
                return NextResponse.json({ error: "Invalid bounding box." }, { status: 400 });
            }
            Object.assign(query, buildGeoWithinQuery(bbox));

            const places = await Place.find(query)
                .select("name category score location image_urls")
                .limit(MAP_MARKER_LIMIT)
                .lean();

            const markers = places.map((p) => ({
                _id: p._id,
                name: p.name,
                category: p.category,
                score: p.score,
                coordinates: p.location.coordinates,
                thumbnail: p.image_urls?.[0] || null,
            }));

            const res = NextResponse.json({ markers, total: markers.length });
            res.headers.set("Cache-Control", "public, s-maxage=15, stale-while-revalidate=30");
            return res;
        }

        // List mode: paginated
        const skip = (page - 1) * PAGE_SIZE;
        const [places, total] = await Promise.all([
            Place.find(query)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(PAGE_SIZE)
                .populate("created_by", "username")
                .lean(),
            Place.countDocuments(query),
        ]);

        const res = NextResponse.json({ places, total, page, pages: Math.ceil(total / PAGE_SIZE) });
        res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
        return res;
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

        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const rl = await rateLimit(`addplace:${user.userId}:${ip}`, 5, 300_000);
        if (!rl.success) {
            return NextResponse.json({ error: "Too many places added. Wait a few minutes." }, { status: 429 });
        }

        const body = await req.json();

        const name = sanitize(body.name || "");
        const city = sanitize(body.city || "kolkata").toLowerCase();
        const description = sanitize(body.description || "");
        const category = body.category;
        const tags = Array.isArray(body.tags) ? body.tags.map((t: string) => sanitize(t)).filter(Boolean).slice(0, 10) : [];
        const best_time = sanitize(body.best_time || "");
        const image_urls = Array.isArray(body.image_urls) ? body.image_urls.filter((u: string) => typeof u === "string" && u.startsWith("http")).slice(0, 5) : [];
        const lat = parseFloat(body.lat);
        const lng = parseFloat(body.lng);

        if (!name || name.length < 2 || name.length > 120) {
            return NextResponse.json({ error: "Name must be 2-120 characters." }, { status: 400 });
        }

        if (!description || description.length < 10 || description.length > 2000) {
            return NextResponse.json({ error: "Description must be 10-2000 characters." }, { status: 400 });
        }

        if (!category || !CATEGORIES.includes(category)) {
            return NextResponse.json({ error: "Invalid category." }, { status: 400 });
        }

        if (!validateCoordinates(lat, lng)) {
            return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
        }

        if (image_urls.length < 1) {
            return NextResponse.json({ error: "At least 1 image required." }, { status: 400 });
        }

        await connectDB();

        const autoApprove = process.env.AUTO_APPROVE_PLACES !== "false";
        const status = autoApprove ? "approved" : "pending";

        const place = await Place.create({
            name,
            city,
            location: { type: "Point", coordinates: [lng, lat] },
            description,
            category,
            tags,
            best_time,
            image_urls,
            status,
            score: calculateScore(0, 0),
            created_by: user.userId,
        });

        return NextResponse.json({ place: { _id: place._id, name: place.name, status: place.status } }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
