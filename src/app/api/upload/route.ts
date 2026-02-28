import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { folder = "wheretokolkata" } = body;

        const timestamp = Math.round(Date.now() / 1000);
        const paramsToSign = {
            timestamp,
            folder,
            transformation: "f_auto,q_auto,w_600",
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET!
        );

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder,
        });
    } catch {
        return NextResponse.json({ error: "Upload config error." }, { status: 500 });
    }
}
