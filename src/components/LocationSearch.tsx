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
        </div>
    );
}
