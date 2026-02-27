import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
    place_id: Types.ObjectId;
    user_id: Types.ObjectId;
    username: string;
    text: string;
    upvotes: number;
    created_at: Date;
}

const CommentSchema = new Schema<IComment>({
    place_id: { type: Schema.Types.ObjectId, ref: "Place", required: true, index: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    text: { type: String, required: true, minlength: 15, maxlength: 1000 },
    upvotes: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
