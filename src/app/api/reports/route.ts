import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { sanitize } from "@/lib/sanitize";
import {
    COMMENT_AUTO_FLAG_THRESHOLD,
    COMMENT_AUTO_REMOVE_THRESHOLD,
    PLACE_AUTO_FLAG_THRESHOLD,
    PLACE_AUTO_REMOVE_THRESHOLD,
    isValidReportReason,
} from "@/lib/moderation";
import Place from "@/models/Place";
import Comment from "@/models/Comment";
import Report from "@/models/Report";
import ModerationAction from "@/models/ModerationAction";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Login required." }, { status: 401 });
        }

        const rl = await rateLimit(`report:${user.userId}`, 20, 60_000);
        if (!rl.success) {
            return NextResponse.json({ error: "Too many reports. Slow down." }, { status: 429 });
        }

        const body = await req.json();
        const targetType = body.targetType;
        const targetId = body.targetId;
        const reason = body.reason;
        const details = sanitize(body.details || "").slice(0, 500);

        if (!["place", "comment"].includes(targetType)) {
            return NextResponse.json({ error: "Invalid report target." }, { status: 400 });
        }
        if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
            return NextResponse.json({ error: "Invalid target ID." }, { status: 400 });
        }
        if (!reason || !isValidReportReason(reason)) {
            return NextResponse.json({ error: "Invalid report reason." }, { status: 400 });
        }

        await connectDB();

        if (targetType === "place") {
            const place = await Place.findById(targetId).select("status report_count").lean<{ _id: unknown; status: string; report_count?: number } | null>();
            if (!place || place.status === "removed") {
                return NextResponse.json({ error: "Place not found." }, { status: 404 });
            }
        } else {
            const comment = await Comment.findById(targetId).select("status report_count").lean<{ _id: unknown; status: string; report_count?: number } | null>();
            if (!comment || comment.status === "removed") {
                return NextResponse.json({ error: "Comment not found." }, { status: 404 });
            }
        }

        try {
            await Report.create({
                target_type: targetType,
                target_id: targetId,
                reporter_id: user.userId,
                reason,
                details,
            });
        } catch (err: unknown) {
            const error = err as { code?: number };
            if (error.code === 11000) {
                return NextResponse.json({ error: "You already reported this content." }, { status: 409 });
            }
            throw err;
        }

        const openCount = await Report.countDocuments({
            target_type: targetType,
            target_id: targetId,
            status: "open",
        });

        if (targetType === "place") {
            const place = await Place.findById(targetId).select("status").lean<{ status: string } | null>();
            if (place) {
                let nextStatus = place.status;
                let autoAction: "auto_flag" | "auto_remove" | null = null;

                if (openCount >= PLACE_AUTO_REMOVE_THRESHOLD && place.status !== "removed") {
                    nextStatus = "removed";
                    autoAction = "auto_remove";
                } else if (openCount >= PLACE_AUTO_FLAG_THRESHOLD && place.status === "approved") {
                    nextStatus = "flagged";
                    autoAction = "auto_flag";
                }

                await Place.updateOne({ _id: targetId }, { $set: { report_count: openCount, status: nextStatus } });

                if (autoAction) {
                    await Report.updateMany(
                        { target_type: "place", target_id: targetId, status: "open" },
                        { $set: { status: "reviewed", action_taken: autoAction, reviewed_at: new Date() } }
                    );

                    await ModerationAction.create({
                        target_type: "place",
                        target_id: targetId,
                        action: autoAction,
                        reason: `community_threshold_${openCount}`,
                        actor_username: "community",
                        metadata: { openCount },
                    });
                }
            }
        } else {
            const comment = await Comment.findById(targetId).select("status").lean<{ status: string } | null>();
            if (comment) {
                let nextStatus = comment.status;
                let autoAction: "auto_flag" | "auto_remove" | null = null;

                if (openCount >= COMMENT_AUTO_REMOVE_THRESHOLD && comment.status !== "removed") {
                    nextStatus = "removed";
                    autoAction = "auto_remove";
                } else if (openCount >= COMMENT_AUTO_FLAG_THRESHOLD && comment.status === "active") {
                    nextStatus = "flagged";
                    autoAction = "auto_flag";
                }

                await Comment.updateOne({ _id: targetId }, { $set: { report_count: openCount, status: nextStatus } });

                if (autoAction) {
                    await Report.updateMany(
                        { target_type: "comment", target_id: targetId, status: "open" },
                        { $set: { status: "reviewed", action_taken: autoAction, reviewed_at: new Date() } }
                    );

                    await ModerationAction.create({
                        target_type: "comment",
                        target_id: targetId,
                        action: autoAction,
                        reason: `community_threshold_${openCount}`,
                        actor_username: "community",
                        metadata: { openCount },
                    });
                }
            }
        }

        return NextResponse.json({ ok: true, openReports: openCount });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
