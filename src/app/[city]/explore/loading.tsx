export default function ExploreLoading() {
    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <div className="skeleton" style={{ width: "200px", height: "32px", marginBottom: "8px" }} />
                    <div className="skeleton" style={{ width: "280px", height: "16px" }} />
                </div>

                {[1, 2].map((section) => (
                    <div key={section} className="section">
                        <div className="skeleton" style={{ width: "180px", height: "22px", marginBottom: "16px" }} />
                        <div className="section-grid">
                            {[1, 2, 3].map((card) => (
                                <div key={card} className="card" style={{ overflow: "hidden" }}>
                                    <div className="skeleton" style={{ width: "100%", aspectRatio: "16/10" }} />
                                    <div style={{ padding: "12px 16px" }}>
                                        <div className="skeleton" style={{ width: "60px", height: "20px", borderRadius: "999px", marginBottom: "8px" }} />
                                        <div className="skeleton" style={{ width: "70%", height: "18px", marginBottom: "6px" }} />
                                        <div className="skeleton" style={{ width: "40%", height: "14px" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
