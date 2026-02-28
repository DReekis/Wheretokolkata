"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface User {
    userId: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<{ error?: string }>;
    register: (username: string, password: string, confirmPassword: string) => Promise<{ error?: string }>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeUser(raw: unknown): User | null {
    if (!raw || typeof raw !== "object") return null;
    const obj = raw as { userId?: string; id?: string; username?: string };
    const userId = obj.userId || obj.id;
    if (!userId || !obj.username) return null;
    return { userId, username: obj.username };
}

export function AuthProvider({ children, initialUser = null }: { children: ReactNode; initialUser?: User | null }) {
    const [user, setUser] = useState<User | null>(initialUser);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            setUser(normalizeUser(data.user));
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (username: string, password: string) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error };
        setUser(normalizeUser(data.user));
        return {};
    };

    const register = async (username: string, password: string, confirmPassword: string) => {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, confirmPassword }),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error };
        setUser(normalizeUser(data.user));
        return {};
    };

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
