"use client";

import { useState, useRef } from "react";
import { IconMapPin } from "@/components/Icons";

interface LocationSearchProps {
    onSelect: (lat: number, lng: number, label: string) => void;
}

interface SearchResult {
    display_name: string;
    lat: string;
    lon: string;
}

export default function LocationSearch({ onSelect }: LocationSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [locating, setLocating] = useState(false);
    const [showCoordInput, setShowCoordInput] = useState(false);
    const [coordText, setCoordText] = useState("");
    const [coordError, setCoordError] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const searchPlaces = async (q: string) => {
        if (q.length < 3) {
            setResults([]);
            return;
        }
        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=5&addressdetails=0`,
                { headers: { "User-Agent": "WhereToKolkata/1.0" } }
            );
            const data = await res.json();
            setResults(data);
        } catch {
            setResults([]);
        }
        setSearching(false);
    };

    const handleInputChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchPlaces(value), 400);
    };

    const handleSelect = (result: SearchResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        onSelect(lat, lng, result.display_name);
        setQuery(result.display_name.split(",")[0]);
        setResults([]);
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                onSelect(lat, lng, "My Location");
                setQuery("My Location");
                setLocating(false);
            },
            (err) => {
                alert("Could not get your location. Please allow location access or search manually.");
                console.error(err);
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const parseCoordinates = (text: string): { lat: number; lng: number } | null => {
        const trimmed = text.trim();
        if (!trimmed) return null;

        // Try "lat, lng" or "lat lng" formats
        const parts = trimmed.split(/[\s,]+/).filter(Boolean);
        if (parts.length !== 2) return null;

        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);

        if (isNaN(lat) || isNaN(lng)) return null;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

        return { lat, lng };
    };

    const handleCoordSubmit = () => {
        setCoordError("");
        const parsed = parseCoordinates(coordText);
        if (!parsed) {
            setCoordError("Invalid format. Use: 22.5726, 88.3639");
            return;
        }
        onSelect(parsed.lat, parsed.lng, `${parsed.lat.toFixed(5)}, ${parsed.lng.toFixed(5)}`);
        setQuery(`${parsed.lat.toFixed(5)}, ${parsed.lng.toFixed(5)}`);
        setShowCoordInput(false);
        setCoordText("");
    };

    return (
        <div className="location-search">
            <div className="location-search-row">
                <div className="location-search-input-wrap">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search for a place, street, or landmark..."
                        value={query}
                        onChange={(e) => handleInputChange(e.target.value)}
                    />
                    {searching && (
                        <div className="location-search-spinner">
                            <div className="spinner" style={{ width: 16, height: 16 }} />
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleUseMyLocation}
                    disabled={locating}
                    title="Use my current location"
                >
                    {locating ? "Locating..." : <><IconMapPin size={14} /> My Location</>}
                </button>
                <button
                    type="button"
                    className={`btn btn-sm ${showCoordInput ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => { setShowCoordInput(!showCoordInput); setCoordError(""); }}
                    title="Paste coordinates"
                >
                    📍 Coordinates
                </button>
            </div>

            {results.length > 0 && (
                <ul className="location-search-results">
                    {results.map((r, i) => (
                        <li key={i} onClick={() => handleSelect(r)} className="location-search-result">
                            {r.display_name}
                        </li>
                    ))}
                </ul>
            )}

            {showCoordInput && (
                <div className="location-search-coords-row">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 22.5726, 88.3639"
                        value={coordText}
                        onChange={(e) => { setCoordText(e.target.value); setCoordError(""); }}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCoordSubmit(); } }}
                        autoFocus
                    />
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleCoordSubmit}
                    >
                        Go
                    </button>
                </div>
            )}
            {coordError && (
                <span className="form-hint" style={{ color: "var(--danger)", marginTop: "var(--space-1)" }}>
                    {coordError}
                </span>
            )}
        </div>
    );
}
