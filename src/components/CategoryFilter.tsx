"use client";

import { CATEGORIES } from "@/lib/constants";

interface CategoryFilterProps {
    selected: string | null;
    onChange: (category: string | null) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
    return (
        <div className="category-filter">
            <button
                className={`category-pill ${selected === null ? "active" : ""}`}
                onClick={() => onChange(null)}
            >
                All
            </button>
            {CATEGORIES.map((cat) => (
                <button
                    key={cat}
                    className={`category-pill ${selected === cat ? "active" : ""}`}
                    onClick={() => onChange(selected === cat ? null : cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
