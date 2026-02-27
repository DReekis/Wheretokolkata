export const CATEGORIES = [
    "Food",
    "Cafes",
    "Viewpoints",
    "Nature",
    "Study Spots",
    "Culture",
    "Hidden Gems",
    "Night Spots",
] as const;

export type PlaceCategory = (typeof CATEGORIES)[number];

export type PlaceStatus = "pending" | "approved" | "flagged" | "removed";
