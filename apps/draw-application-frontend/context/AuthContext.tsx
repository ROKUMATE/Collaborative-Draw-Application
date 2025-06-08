"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
    user: {
        id: number;
        username: string;
    } | null;
    setUser: (user: { id: number; username: string } | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<{
        id: number;
        username: string;
    } | null>(null);

    return (
        <AuthContext.Provider value={{ token, setToken, user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
