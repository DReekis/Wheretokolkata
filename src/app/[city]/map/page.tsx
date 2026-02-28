import MapPageClient from "@/components/MapPageClient";
import { CITY_CONFIG, type SupportedCity } from "@/lib/cities";

interface MapPageProps {
    params: Promise<{ city: string }>;
}

export default async function MapPage({ params }: MapPageProps) {
    const { city } = await params;
    const config = CITY_CONFIG[city as SupportedCity] || CITY_CONFIG.kolkata;

    return <MapPageClient city={city} center={config.center} zoom={config.zoom} />;
}
