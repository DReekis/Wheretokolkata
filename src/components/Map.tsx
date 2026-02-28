"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = defaultIcon;

const CATEGORY_COLORS: Record<string, string> = {
    Food: "#ef476f",
    Cafes: "#bc6c25",
    Viewpoints: "#06d6a0",
    Nature: "#2d6a4f",
    "Study Spots": "#4361ee",
    Culture: "#7209b7",
    "Hidden Gems": "#f77f00",
    "Night Spots": "#480ca8",
};

interface Marker {
    _id: string;
    name: string;
    category: string;
    score: number;
    coordinates: [number, number];
}

interface MapComponentProps {
    center: [number, number];
    zoom: number;
    city: string;
    category?: string | null;
    onMarkerClick?: (id: string) => void;
    clickToAdd?: boolean;
    onMapClick?: (lat: number, lng: number) => void;
    selectedPosition?: [number, number] | null;
}

function getCategoryIcon(category: string) {
    const color = CATEGORY_COLORS[category] || "#4361ee";
    return L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
    });
}

export default function MapComponent({
    center,
    zoom,
    city,
    category,
    onMarkerClick,
    clickToAdd,
    onMapClick,
    selectedPosition,
}: MapComponentProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.LayerGroup | null>(null);
    const selectedMarkerRef = useRef<L.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    const fetchMarkers = useCallback(
        async (map: L.Map) => {
            const bounds = map.getBounds();
            const params = new URLSearchParams({
                mode: "map",
                city,
                south: String(bounds.getSouth()),
                west: String(bounds.getWest()),
                north: String(bounds.getNorth()),
                east: String(bounds.getEast()),
            });
            if (category) params.set("category", category);

            setLoading(true);
            try {
                const res = await fetch(`/api/places?${params}`);
                const data = await res.json();

                markersRef.current?.clearLayers();

                (data.markers || []).forEach((markerData: Marker) => {
                    const marker = L.marker([markerData.coordinates[1], markerData.coordinates[0]], {
                        icon: getCategoryIcon(markerData.category),
                    });

                    const scorePercent = Math.round(markerData.score * 100);
                    marker.bindPopup(
                        `<div class="map-popup-card">
              <h3>${markerData.name}</h3>
              <p>${markerData.category} - ${scorePercent}% recommended</p>
            </div>`,
                        { closeButton: false, maxWidth: 220 }
                    );

                    marker.on("click", () => onMarkerClick?.(markerData._id));
                    markersRef.current?.addLayer(marker);
                });
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        },
        [city, category, onMarkerClick]
    );

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center,
            zoom,
            zoomControl: false,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        markersRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;

        map.on("moveend", () => fetchMarkers(map));

        if (clickToAdd) {
            map.on("click", (e: L.LeafletMouseEvent) => onMapClick?.(e.latlng.lat, e.latlng.lng));
        }

        fetchMarkers(map);

        return () => {
            map.remove();
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (mapRef.current) {
            fetchMarkers(mapRef.current);
        }
    }, [category, fetchMarkers]);

    useEffect(() => {
        mapRef.current?.setView(center, zoom);
    }, [center, zoom]);

    useEffect(() => {
        selectedMarkerRef.current?.remove();
        selectedMarkerRef.current = null;

        if (selectedPosition && mapRef.current) {
            selectedMarkerRef.current = L.marker(selectedPosition).addTo(mapRef.current);
        }
    }, [selectedPosition]);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
            {loading && (
                <div
                    style={{
                        position: "absolute",
                        top: "var(--space-3)",
                        right: "var(--space-3)",
                        background: "white",
                        borderRadius: "var(--radius-sm)",
                        padding: "var(--space-2) var(--space-3)",
                        boxShadow: "var(--shadow-md)",
                        fontSize: "var(--font-size-xs)",
                        zIndex: 1000,
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                    }}
                >
                    <div className="spinner" style={{ width: 14, height: 14 }} /> Loading...
                </div>
            )}
        </div>
    );
}
