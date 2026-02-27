import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    password_hash: string;
    karma: number;
    created_at: Date;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 2, maxlength: 30 },
    password_hash: { type: String, required: true },
    karma: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
