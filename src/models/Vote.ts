import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVote extends Document {
    user_id: Types.ObjectId;
    place_id: Types.ObjectId;
    vote: 1 | -1;
}

const VoteSchema = new Schema<IVote>({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    place_id: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    vote: { type: Number, enum: [1, -1], required: true },
});

VoteSchema.index({ user_id: 1, place_id: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema);
