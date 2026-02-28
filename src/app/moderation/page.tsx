import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentModerator } from "@/lib/moderation";
import Place from "@/models/Place";
import Comment from "@/models/Comment";
import Report from "@/models/Report";
import ModerationAction from "@/models/ModerationAction";

async function applyModerationAction(formData: FormData) {
    "use server";

    const moderator = await getCurrentModerator();
    if (!moderator) {
        redirect("/login");
    }

    const targetType = String(formData.get("targetType") || "");
    const targetId = String(formData.get("targetId") || "");
    const reportId = String(formData.get("reportId") || "");
    const action = String(formData.get("action") || "");
    const reason = String(formData.get("reason") || "").slice(0, 300);

    if (!["place", "comment"].includes(targetType)) return;
    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) return;
    if (!["remove", "restore", "dismiss"].includes(action)) return;

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

    revalidatePath("/moderation");
}

export default async function ModerationPage() {
    const moderator = await getCurrentModerator();
    if (!moderator) {
        redirect("/login");
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

    const placeIds = reports.filter((report) => report.target_type === "place").map((report) => report.target_id);
    const commentIds = reports.filter((report) => report.target_type === "comment").map((report) => report.target_id);

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

    return (
        <div className="page">
            <div className="content-container">
                <div className="page-header">
                    <h1 className="page-title">Moderation Queue</h1>
                    <p className="page-subtitle">Open community reports: {reports.length}</p>
                </div>

                {reports.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-state-title">No open reports</p>
                        <p>Everything looks clean right now.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                        {reports.map((report) => {
                            const targetId = String(report.target_id);
                            const target = report.target_type === "place" ? placeMap.get(targetId) : commentMap.get(targetId);
                            const targetMissing = !target;

                            return (
                                <div key={String(report._id)} className="card" style={{ padding: "var(--space-4)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", flexWrap: "wrap" }}>
                                        <div>
                                            <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>
                                                {report.target_type === "place" ? "Place Report" : "Comment Report"}
                                            </p>
                                            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                                                by {report.reporter_id?.username || "unknown"} - {new Date(report.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className="badge badge-hidden">{report.reason}</span>
                                    </div>

                                    {report.details && (
                                        <p style={{ marginTop: "var(--space-2)", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                                            {report.details}
                                        </p>
                                    )}

                                    <div style={{ marginTop: "var(--space-3)", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "var(--space-3)" }}>
                                        {targetMissing ? (
                                            <p style={{ fontSize: "var(--font-size-sm)" }}>Target content no longer exists.</p>
                                        ) : report.target_type === "place" ? (
                                            <>
                                                <p style={{ fontWeight: 600 }}>{(target as { name: string }).name}</p>
                                                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                                                    {(target as { city: string; category: string }).city} - {(target as { category: string }).category} - status: {(target as { status: string }).status} - reports: {(target as { report_count?: number }).report_count || 0}
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p style={{ fontSize: "var(--font-size-sm)" }}>
                                                    {(target as { text: string }).text}
                                                </p>
                                                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
                                                    by {(target as { username: string }).username} - status: {(target as { status: string }).status} - reports: {(target as { report_count?: number }).report_count || 0}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)", flexWrap: "wrap" }}>
                                        <form action={applyModerationAction}>
                                            <input type="hidden" name="targetType" value={report.target_type} />
                                            <input type="hidden" name="targetId" value={targetId} />
                                            <input type="hidden" name="reportId" value={String(report._id)} />
                                            <input type="hidden" name="action" value="remove" />
                                            <input type="hidden" name="reason" value={`manual_remove:${report.reason}`} />
                                            <button type="submit" className="btn btn-danger btn-sm">Remove</button>
                                        </form>

                                        <form action={applyModerationAction}>
                                            <input type="hidden" name="targetType" value={report.target_type} />
                                            <input type="hidden" name="targetId" value={targetId} />
                                            <input type="hidden" name="reportId" value={String(report._id)} />
                                            <input type="hidden" name="action" value="restore" />
                                            <input type="hidden" name="reason" value={`manual_restore:${report.reason}`} />
                                            <button type="submit" className="btn btn-secondary btn-sm">Restore</button>
                                        </form>

                                        <form action={applyModerationAction}>
                                            <input type="hidden" name="targetType" value={report.target_type} />
                                            <input type="hidden" name="targetId" value={targetId} />
                                            <input type="hidden" name="reportId" value={String(report._id)} />
                                            <input type="hidden" name="action" value="dismiss" />
                                            <input type="hidden" name="reason" value={`dismissed:${report.reason}`} />
                                            <button type="submit" className="btn btn-ghost btn-sm">Dismiss Report</button>
                                        </form>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
