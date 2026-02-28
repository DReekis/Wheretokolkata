import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentModerator } from "@/lib/moderation";
import Place from "@/models/Place";
import Comment from "@/models/Comment";
import Report from "@/models/Report";
import ModerationAction from "@/models/ModerationAction";

export async function POST(req: NextRequest) {
    try {
        const moderator = await getCurrentModerator();
        if (!moderator) {
            return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        const body = await req.json();
        const targetType = body.targetType;
        const targetId = body.targetId;
        const action = body.action;
        const reason = typeof body.reason === "string" ? body.reason.slice(0, 300) : "";
        const reportId = typeof body.reportId === "string" ? body.reportId : "";

        if (!["place", "comment"].includes(targetType)) {
            return NextResponse.json({ error: "Invalid target type." }, { status: 400 });
        }
        if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
            return NextResponse.json({ error: "Invalid target ID." }, { status: 400 });
        }
        if (!["remove", "restore", "dismiss"].includes(action)) {
            return NextResponse.json({ error: "Invalid action." }, { status: 400 });
        }

        await connectDB();

        if (targetType === "place") {
            if (action === "remove") {
                await Place.updateOne({ _id: targetId }, { $set: { status: "removed" } });
            }
            if (action === "restore") {
                await Place.updateOne({ _id: targetId }, { $set: { status: "approved" } });
            }
        } else {
            if (action === "remove") {
                await Comment.updateOne({ _id: targetId }, { $set: { status: "removed" } });
            }
            if (action === "restore") {
                await Comment.updateOne({ _id: targetId }, { $set: { status: "active" } });
            }
        }

        if (reportId && mongoose.Types.ObjectId.isValid(reportId)) {
            await Report.updateOne(
                { _id: reportId },
                {
                    $set: {
                        status: action === "dismiss" ? "dismissed" : "reviewed",
                        action_taken: action,
                        reviewed_at: new Date(),
                        reviewed_by: moderator.userId,
                    },
                }
            );
        } else {
            await Report.updateMany(
                { target_type: targetType, target_id: targetId, status: "open" },
                {
                    $set: {
                        status: action === "dismiss" ? "dismissed" : "reviewed",
                        action_taken: action,
                        reviewed_at: new Date(),
                        reviewed_by: moderator.userId,
                    },
                }
            );
        }

        const openCount = await Report.countDocuments({
            target_type: targetType,
            target_id: targetId,
            status: "open",
        });

        if (targetType === "place") {
            await Place.updateOne({ _id: targetId }, { $set: { report_count: openCount } });
        } else {
            await Comment.updateOne({ _id: targetId }, { $set: { report_count: openCount } });
        }

        await ModerationAction.create({
            target_type: targetType,
            target_id: targetId,
            action: action === "dismiss" ? "dismiss_report" : action,
            reason,
            actor_id: moderator.userId,
            actor_username: moderator.username,
            metadata: reportId ? { reportId } : {},
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
    }
}
