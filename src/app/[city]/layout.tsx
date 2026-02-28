import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isValidCity, CITY_CONFIG, type SupportedCity } from "@/lib/cities";
import { absoluteUrl } from "@/lib/site";

interface CityLayoutProps {
    children: React.ReactNode;
    params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: CityLayoutProps): Promise<Metadata> {
    const { city } = await params;
    if (!isValidCity(city)) return {};

    const config = CITY_CONFIG[city as SupportedCity];
    const canonicalUrl = absoluteUrl(`/${city}/explore`);

    return {
        title: `WhereTo${config.name} - Discover Special Places`,
        description: `Community-driven map to discover meaningful places in ${config.name}.`,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: `WhereTo${config.name}`,
            description: `Community-driven map to discover meaningful places in ${config.name}.`,
            url: canonicalUrl,
            images: [{ url: "/opengraph-image" }],
        },
    };
}

export default async function CityLayout({ children, params }: CityLayoutProps) {
    const { city } = await params;

    if (!isValidCity(city)) {
        notFound();
    }

    return <>{children}</>;
}
