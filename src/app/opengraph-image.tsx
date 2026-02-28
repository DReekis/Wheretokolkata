import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WhereToKolkata";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    padding: "70px",
                    background: "linear-gradient(135deg, #f9fafb 0%, #e8edff 100%)",
                    color: "#1a1a2e",
                    fontFamily: "sans-serif",
                }}
            >
                <div
                    style={{
                        fontSize: 26,
                        letterSpacing: "0.1em",
                        color: "#4361ee",
                        marginBottom: 16,
                    }}
                >
                    WHERETOKOLKATA
                </div>
                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 700,
                        lineHeight: 1.1,
                        marginBottom: 16,
                    }}
                >
                    Discover Special
                    <br />
                    Places in Kolkata
                </div>
                <div style={{ fontSize: 28, color: "#555770" }}>
                    Community-driven recommendations, votes, and moderation.
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
