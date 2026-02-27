import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISavedPlace extends Document {
    user_id: Types.ObjectId;
    place_id: Types.ObjectId;
    created_at: Date;
}

const SavedPlaceSchema = new Schema<ISavedPlace>({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    place_id: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    created_at: { type: Date, default: Date.now },
});

SavedPlaceSchema.index({ user_id: 1, place_id: 1 }, { unique: true });
SavedPlaceSchema.index({ user_id: 1, created_at: -1 });

export default mongoose.models.SavedPlace || mongoose.model<ISavedPlace>("SavedPlace", SavedPlaceSchema);
