import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
    place_id: Types.ObjectId;
    user_id: Types.ObjectId;
    username: string;
    text: string;
    upvotes: number;
    status: "active" | "flagged" | "removed";
    report_count: number;
    created_at: Date;
}

const CommentSchema = new Schema<IComment>({
    place_id: { type: Schema.Types.ObjectId, ref: "Place", required: true, index: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    text: { type: String, required: true, minlength: 15, maxlength: 1000 },
    upvotes: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "flagged", "removed"], default: "active", index: true },
    report_count: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
});

CommentSchema.index({ place_id: 1, status: 1, created_at: -1 });
CommentSchema.index({ status: 1, report_count: -1, created_at: -1 });

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
