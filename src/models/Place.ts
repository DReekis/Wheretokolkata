import mongoose, { Schema, Document, Types } from "mongoose";
import { CATEGORIES, type PlaceCategory, type PlaceStatus } from "@/lib/constants";

export { CATEGORIES, type PlaceCategory, type PlaceStatus };

export interface IPlace extends Document {
    name: string;
    city: string;
    location: {
        type: "Point";
        coordinates: [number, number]; // [lng, lat]
    };
    description: string;
    category: PlaceCategory;
    tags: string[];
    best_time: string;
    image_urls: string[];
    upvotes: number;
    downvotes: number;
    score: number;
    status: PlaceStatus;
    last_verified_at: Date | null;
    visit_confirmations: number;
    report_count: number;
    created_by: Types.ObjectId;
    created_at: Date;
}

const PlaceSchema = new Schema<IPlace>({
    name: { type: String, required: true, trim: true, maxlength: 120 },
    city: { type: String, required: true, lowercase: true, trim: true, index: true },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    description: { type: String, required: true, maxlength: 2000 },
    category: { type: String, required: true, enum: CATEGORIES },
    tags: { type: [String], default: [] },
    best_time: { type: String, default: "" },
    image_urls: { type: [String], required: true, validate: [(v: string[]) => v.length >= 1 && v.length <= 5, "1-5 images required"] },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "approved", "flagged", "removed"], default: "approved" },
    last_verified_at: { type: Date, default: null },
    visit_confirmations: { type: Number, default: 0 },
    report_count: { type: Number, default: 0 },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    created_at: { type: Date, default: Date.now },
});

PlaceSchema.index({ location: "2dsphere" });
PlaceSchema.index({ city: 1, category: 1, status: 1 });
PlaceSchema.index({ city: 1, status: 1, score: -1 });
PlaceSchema.index({ city: 1, status: 1, created_at: -1 });
PlaceSchema.index({ city: 1, status: 1, visit_confirmations: -1 });
PlaceSchema.index({ status: 1, report_count: -1, created_at: -1 });

export default mongoose.models.Place || mongoose.model<IPlace>("Place", PlaceSchema);
