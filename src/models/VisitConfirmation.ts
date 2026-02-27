import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVisitConfirmation extends Document {
    user_id: Types.ObjectId;
    place_id: Types.ObjectId;
    created_at: Date;
}

const VisitConfirmationSchema = new Schema<IVisitConfirmation>({
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    place_id: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    created_at: { type: Date, default: Date.now },
});

VisitConfirmationSchema.index({ user_id: 1, place_id: 1 }, { unique: true });

export default mongoose.models.VisitConfirmation || mongoose.model<IVisitConfirmation>("VisitConfirmation", VisitConfirmationSchema);
