"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryFilter from "@/components/CategoryFilter";
import LazyMap from "@/components/LazyMap";

interface MapPageClientProps {
    city: string;
    center: [number, number];
    zoom: number;
}

export default function MapPageClient({ city, center, zoom }: MapPageClientProps) {
    const router = useRouter();
    const [category, setCategory] = useState<string | null>(null);

    return (
        <div className="map-container">
            <div className="map-overlay">
                <CategoryFilter selected={category} onChange={setCategory} />
            </div>
            <LazyMap
                center={center}
                zoom={zoom}
                city={city}
                category={category}
                onMarkerClick={(id) => router.push(`/${city}/place/${id}`)}
            />
        </div>
    );
}
