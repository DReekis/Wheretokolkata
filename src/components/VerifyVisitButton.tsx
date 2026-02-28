import { IconCheck } from "@/components/Icons";

interface VerifyVisitButtonProps {
    confirmed: boolean;
    confirmations: number;
    action: () => Promise<void>;
}

export default function VerifyVisitButton({ confirmed, confirmations, action }: VerifyVisitButtonProps) {
    return (
        <form action={action}>
            <button
                type="submit"
                className={`btn ${confirmed ? "btn-primary" : "btn-secondary"} btn-sm`}
                disabled={confirmed}
                style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
                <IconCheck size={14} />
                {confirmed ? "Verified" : "I visited recently"}{confirmations > 0 ? ` (${confirmations})` : ""}
            </button>
        </form>
    );
}
