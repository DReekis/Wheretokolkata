import { IconStar, IconStarOutline } from "@/components/Icons";

interface SaveButtonProps {
    saved: boolean;
    action: () => Promise<void>;
}

export default function SaveButton({ saved, action }: SaveButtonProps) {
    return (
        <form action={action}>
            <button
                type="submit"
                className={`btn ${saved ? "btn-primary" : "btn-secondary"} btn-sm`}
                style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
                {saved ? <IconStar size={14} /> : <IconStarOutline size={14} />}
                {saved ? "Saved" : "Save"}
            </button>
        </form>
    );
}
