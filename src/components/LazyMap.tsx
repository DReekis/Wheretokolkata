"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const MapComponent = dynamic(() => import("@/components/Map"), { ssr: false });

interface LazyMapProps {
    center: [number, number];
    zoom: number;
    city: string;
    category?: string | null;
    onMarkerClick?: (id: string) => void;
    clickToAdd?: boolean;
    onMapClick?: (lat: number, lng: number) => void;
    selectedPosition?: [number, number] | null;
    rootMargin?: string;
}

export default function LazyMap({
    rootMargin = "200px",
    ...props
}: LazyMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!containerRef.current || isVisible) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin }
        );

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [isVisible, rootMargin]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
            {isVisible ? (
                <MapComponent {...props} />
            ) : (
                <div className="map-lazy-placeholder">
                    <div className="spinner" />
                </div>
            )}
        </div>
    );
}
