import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
    const checks = {
        status: "ok" as "ok" | "degraded",
        db: false,
        cloudinary: false,
        timestamp: new Date().toISOString(),
    };

    // Database check
    try {
        checks.db = mongoose.connection.readyState === 1;
    } catch {
        checks.db = false;
    }

    // Cloudinary config check
    checks.cloudinary = !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    if (!checks.db || !checks.cloudinary) {
        checks.status = "degraded";
    }

    return NextResponse.json(checks);
}
