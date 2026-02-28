import mongoose, { Schema, Document, Types } from "mongoose";

export interface IModerationAction extends Document {
    target_type: "place" | "comment" | "report";
    target_id: Types.ObjectId;
    action: "auto_flag" | "auto_remove" | "remove" | "restore" | "dismiss_report";
    reason: string;
    actor_id: Types.ObjectId | null;
    actor_username: string;
    metadata: Record<string, unknown>;
    created_at: Date;
}

const ModerationActionSchema = new Schema<IModerationAction>({
    target_type: { type: String, enum: ["place", "comment", "report"], required: true, index: true },
    target_id: { type: Schema.Types.ObjectId, required: true, index: true },
    action: { type: String, enum: ["auto_flag", "auto_remove", "remove", "restore", "dismiss_report"], required: true },
    reason: { type: String, default: "" },
    actor_id: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    actor_username: { type: String, default: "system" },
    metadata: { type: Schema.Types.Mixed, default: {} },
    created_at: { type: Date, default: Date.now, index: true },
});

ModerationActionSchema.index({ target_type: 1, target_id: 1, created_at: -1 });

export default mongoose.models.ModerationAction || mongoose.model<IModerationAction>("ModerationAction", ModerationActionSchema);
