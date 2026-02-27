import { notFound } from "next/navigation";
import { isValidCity, CITY_CONFIG, type SupportedCity } from "@/lib/cities";
import type { Metadata } from "next";

interface CityLayoutProps {
    children: React.ReactNode;
    params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: CityLayoutProps): Promise<Metadata> {
    const { city } = await params;
    if (!isValidCity(city)) return {};

    const config = CITY_CONFIG[city as SupportedCity];
    return {
        title: `WhereTo${config.name} — Discover Special Places`,
        description: `Community-driven map to discover meaningful places in ${config.name}.`,
    };
}

export default async function CityLayout({ children, params }: CityLayoutProps) {
    const { city } = await params;

    if (!isValidCity(city)) {
        notFound();
    }

    return <>{children}</>;
}
