import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentModerator } from "@/lib/moderation";
import Report from "@/models/Report";
import Place from "@/models/Place";
import Comment from "@/models/Comment";

export async function GET() {
    try {
        const moderator = await getCurrentModerator();
        if (!moderator) {
            return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        await connectDB();

        const reports = await Report.find({ status: "open" })
            .sort({ created_at: -1 })
            .limit(200)
            .select("target_type target_id reporter_id reason details created_at")
            .populate("reporter_id", "username")
            .lean<{
                _id: unknown;
                target_type: "place" | "comment";
                target_id: unknown;
                reporter_id?: { username?: string };
                reason: string;
                details?: string;
                created_at: Date | string;
            }[]>();

        const placeIds = reports.filter((r) => r.target_type === "place").map((r) => r.target_id);
        const commentIds = reports.filter((r) => r.target_type === "comment").map((r) => r.target_id);

        const [places, comments] = await Promise.all([
            placeIds.length
                ? Place.find({ _id: { $in: placeIds } })
                    .select("name city category status report_count")
                    .lean<{ _id: unknown; name: string; city: string; category: string; status: string; report_count?: number }[]>()
                : Promise.resolve([]),
            commentIds.length
                ? Comment.find({ _id: { $in: commentIds } })
                    .select("text username place_id status report_count")
                    .lean<{ _id: unknown; text: string; username: string; place_id: unknown; status: string; report_count?: number }[]>()
                : Promise.resolve([]),
        ]);

        const placeMap = new Map(places.map((place) => [String(place._id), place]));
        const commentMap = new Map(comments.map((comment) => [String(comment._id), comment]));

        const queue = reports.map((report) => {
            const targetId = String(report.target_id);
            const target = report.target_type === "place" ? placeMap.get(targetId) : commentMap.get(targetId);
            return {
                _id: String(report._id),
                targetType: report.target_type,
                targetId,
                reason: report.reason,
                details: report.details || "",
                createdAt: report.created_at,
                reporter: report.reporter_id?.username || "unknown",
                target: target || null,
            };
        });

        const res = NextResponse.json({ queue });
        res.headers.set("Cache-Control", "no-store");
        return res;
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
