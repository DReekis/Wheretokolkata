"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import LocationSearch from "@/components/LocationSearch";
import LazyMap from "@/components/LazyMap";
import { IconMapPin } from "@/components/Icons";
import { CATEGORIES } from "@/lib/constants";

interface AddPlaceFormProps {
    city: string;
    initialCenter: [number, number];
    initialZoom: number;
}

export default function AddPlaceForm({ city, initialCenter, initialZoom }: AddPlaceFormProps) {
    const router = useRouter();

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [bestTime, setBestTime] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [coords, setCoords] = useState<[number, number] | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
    const [mapZoom, setMapZoom] = useState(initialZoom);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) { setError("Name is required."); return; }
        if (!category) { setError("Category is required."); return; }
        if (!description.trim() || description.trim().length < 10) { setError("Description must be at least 10 characters."); return; }
        if (images.length < 1) { setError("At least 1 image is required."); return; }
        if (!coords) { setError("Click the map to set the location."); return; }

        setSubmitting(true);
        try {
            const res = await fetch("/api/places", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    city,
                    category,
                    description: description.trim(),
                    tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                    best_time: bestTime.trim(),
                    image_urls: images,
                    lat: coords[0],
                    lng: coords[1],
                }),
            });
            const data = await res.json();
            if (res.ok) {
                router.push(`/${city}/place/${data.place._id}`);
            } else {
                setError(data.error || "Failed to add place.");
            }
        } catch {
            setError("Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Place Name *</label>
                <input
                    id="place-name"
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Victoria Memorial rooftop view"
                    maxLength={120}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                    id="place-category"
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">Select category...</option>
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Why is this place special? *</label>
                <textarea
                    id="place-description"
                    className="form-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what makes this place worth visiting..."
                    maxLength={2000}
                    rows={5}
                />
                <span className="form-hint">{description.length}/2000</span>
            </div>

            <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                    id="place-tags"
                    type="text"
                    className="form-input"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. sunset, quiet, photo-worthy"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Best Time to Visit</label>
                <input
                    id="place-best-time"
                    type="text"
                    className="form-input"
                    value={bestTime}
                    onChange={(e) => setBestTime(e.target.value)}
                    placeholder="e.g. Evening, Weekends"
                />
            </div>

            <div className="form-group">
                <label className="form-label">Photos * (1-5 images, max 5MB each)</label>
                <ImageUpload images={images} onChange={setImages} />
            </div>

            <div className="form-group">
                <label className="form-label">Location * (search or use GPS)</label>
                <LocationSearch
                    onSelect={(lat, lng) => {
                        setCoords([lat, lng]);
                        setMapCenter([lat, lng]);
                        setMapZoom(16);
                    }}
                />
                <div style={{ height: "300px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)", marginTop: "var(--space-2)" }}>
                    <LazyMap
                        center={mapCenter}
                        zoom={mapZoom}
                        city={city}
                        clickToAdd
                        onMapClick={(lat, lng) => setCoords([lat, lng])}
                        selectedPosition={coords}
                        rootMargin="100px"
                    />
                </div>
                {coords && (
                    <span className="form-hint" style={{ marginTop: "var(--space-1)" }}>
                        <IconMapPin size={14} /> {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
                    </span>
                )}
                <span className="form-hint">Search above, use GPS, or click the map to fine-tune</span>
            </div>

            {error && (
                <div style={{ background: "#fde8ed", border: "1px solid var(--danger)", borderRadius: "var(--radius-sm)", padding: "var(--space-3)", marginBottom: "var(--space-4)", fontSize: "var(--font-size-sm)", color: "var(--danger)" }}>
                    {error}
                </div>
            )}

            <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: "100%" }}
                disabled={submitting}
            >
                {submitting ? "Adding Place..." : "Add Place"}
            </button>
        </form>
    );
}
