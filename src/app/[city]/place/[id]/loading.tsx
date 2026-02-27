export default function PlaceLoading() {
    return (
        <div className="page">
            <div className="content-container">
                <div className="skeleton" style={{ width: "100%", aspectRatio: "16/9", borderRadius: "0 0 16px 16px" }} />
                <div style={{ padding: "24px 16px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                        <div className="skeleton" style={{ width: "60px", height: "22px", borderRadius: "999px" }} />
                        <div className="skeleton" style={{ width: "50px", height: "22px", borderRadius: "999px" }} />
                    </div>
                    <div className="skeleton" style={{ width: "80%", height: "28px", marginBottom: "12px" }} />
                    <div className="skeleton" style={{ width: "100%", height: "16px", marginBottom: "8px" }} />
                    <div className="skeleton" style={{ width: "90%", height: "16px", marginBottom: "8px" }} />
                    <div className="skeleton" style={{ width: "60%", height: "16px", marginBottom: "24px" }} />
                    <div style={{ display: "flex", gap: "12px" }}>
                        <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "6px" }} />
                        <div className="skeleton" style={{ width: "50px", height: "36px", borderRadius: "6px" }} />
                        <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "6px" }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
