import { ImageResponse } from "next/og";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Place from "@/models/Place";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = {
    width: 1200,
    height: 630,
};

interface OgImageProps {
    params: Promise<{ id: string; city: string }>;
}

export default async function OpengraphImage({ params }: OgImageProps) {
    const { id, city } = await params;
    let title = "WhereToKolkata";
    let subtitle = `Discover places in ${city}`;

    if (mongoose.Types.ObjectId.isValid(id)) {
        await connectDB();
        const place = await Place.findById(id)
            .select("name category city status")
            .lean<{ name: string; category: string; city: string; status: string } | null>();

        if (place && place.status === "approved") {
            title = place.name;
            subtitle = `${place.category} - ${place.city}`;
        }
    }

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "56px",
                    background: "linear-gradient(135deg, #f5f7fa 0%, #e8edff 100%)",
                    color: "#1a1a2e",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ fontSize: 28, color: "#4361ee", letterSpacing: "0.1em" }}>WHERETOKOLKATA</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.08 }}>{title}</div>
                    <div style={{ fontSize: 30, color: "#555770" }}>{subtitle}</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
