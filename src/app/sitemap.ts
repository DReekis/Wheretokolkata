import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import Place from "@/models/Place";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = getSiteUrl();
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: `${siteUrl}/`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${siteUrl}/kolkata/explore`,
            lastModified: now,
            changeFrequency: "hourly",
            priority: 0.95,
        },
        {
            url: `${siteUrl}/kolkata/map`,
            lastModified: now,
            changeFrequency: "hourly",
            priority: 0.9,
        },
    ];

    try {
        await connectDB();
        const places = await Place.find({ status: "approved" })
            .select("_id city created_at")
            .lean<{ _id: unknown; city: string; created_at?: Date | string }[]>();

        const placeRoutes: MetadataRoute.Sitemap = places.map((place) => ({
            url: `${siteUrl}/${place.city}/place/${String(place._id)}`,
            lastModified: place.created_at ? new Date(place.created_at) : now,
            changeFrequency: "weekly",
            priority: 0.8,
        }));

        return [...staticRoutes, ...placeRoutes];
    } catch {
        return staticRoutes;
    }
}
