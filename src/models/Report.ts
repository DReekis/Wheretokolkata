import mongoose, { Schema, Document, Types } from "mongoose";

export type ReportTargetType = "place" | "comment";
export type ReportStatus = "open" | "reviewed" | "dismissed";
export type ReportReason =
    | "gore_or_violence"
    | "nudity_or_sexual"
    | "hate_or_harassment"
    | "spam_or_scam"
    | "misleading_or_fake"
    | "other";

export interface IReport extends Document {
    target_type: ReportTargetType;
    target_id: Types.ObjectId;
    reporter_id: Types.ObjectId;
    reason: ReportReason;
    details: string;
    status: ReportStatus;
    action_taken: string;
    created_at: Date;
    reviewed_at: Date | null;
    reviewed_by: Types.ObjectId | null;
}

const ReportSchema = new Schema<IReport>({
    target_type: { type: String, enum: ["place", "comment"], required: true, index: true },
    target_id: { type: Schema.Types.ObjectId, required: true, index: true },
    reporter_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reason: {
        type: String,
        enum: ["gore_or_violence", "nudity_or_sexual", "hate_or_harassment", "spam_or_scam", "misleading_or_fake", "other"],
        required: true,
    },
    details: { type: String, default: "", maxlength: 500 },
    status: { type: String, enum: ["open", "reviewed", "dismissed"], default: "open", index: true },
    action_taken: { type: String, default: "none" },
    created_at: { type: Date, default: Date.now, index: true },
    reviewed_at: { type: Date, default: null },
    reviewed_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
});

ReportSchema.index({ reporter_id: 1, target_type: 1, target_id: 1 }, { unique: true });
ReportSchema.index({ target_type: 1, target_id: 1, status: 1, created_at: -1 });

export default mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
