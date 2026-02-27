"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import CategoryFilter from "@/components/CategoryFilter";
import { CITY_CONFIG, type SupportedCity } from "@/lib/cities";

const MapComponent = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapPage() {
    const params = useParams();
    const router = useRouter();
    const city = (params.city as string) || "kolkata";
    const [category, setCategory] = useState<string | null>(null);

    const config = CITY_CONFIG[city as SupportedCity] || CITY_CONFIG.kolkata;

    const handleMarkerClick = (id: string) => {
        router.push(`/${city}/place/${id}`);
    };

    return (
        <>
            <div className="map-container">
                <div className="map-overlay">
                    <CategoryFilter selected={category} onChange={setCategory} />
                </div>
                <MapComponent
                    center={config.center}
                    zoom={config.zoom}
                    city={city}
                    category={category}
                    onMarkerClick={handleMarkerClick}
                />
            </div>
        </>
    );
}
