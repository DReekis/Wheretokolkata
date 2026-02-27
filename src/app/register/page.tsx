"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { IconWarning } from "@/components/Icons";

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        const result = await register(username, password, confirmPassword);
        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push("/kolkata/explore");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-title">Create account</h1>

                <div className="auth-warning" style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ flexShrink: 0, marginTop: 2 }}><IconWarning size={16} color="var(--warning)" /></span>
                    <span><strong>Remember your password!</strong> There is no password reset or recovery system. If you forget your password, your account cannot be recovered.</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            id="register-username"
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="lowercase, letters, numbers, underscores"
                            autoComplete="username"
                            required
                            minLength={2}
                            maxLength={30}
                        />
                        <span className="form-hint">2-30 characters, lowercase only</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            id="register-password"
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                            minLength={6}
                        />
                        <span className="form-hint">Minimum 6 characters</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            id="register-confirm-password"
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    {error && <p className="form-error" style={{ marginBottom: "var(--space-3)" }}>{error}</p>}

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link href="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}
