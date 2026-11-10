"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    role: string | null;
    loading: boolean;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isBypassed, setIsBypassed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const fetchRole = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (!error && data) {
            setRole(data.role);
        } else {
            setRole('farmer'); // Default role
        }
    };

    useEffect(() => {
        // Check for local bypass first
        const bypassActive = localStorage.getItem("agrosense_admin_bypass") === "true";
        if (bypassActive) {
            const bypassUser = {
                id: "00000000-0000-0000-0000-000000000000",
                email: "admin.local@agrosense.team",
                user_metadata: { full_name: "Platform Admin (Bypass)" },
                app_metadata: {},
                aud: "authenticated",
                created_at: new Date().toISOString()
            } as any;

            setIsBypassed(true);
            setUser(bypassUser);
            setRole("admin");
            setLoading(false);

            // OPTIONAL: Proactively ensure the bypass user has a profile record
            // This is "best effort" and will fail if the user is completely offline or rate-limited, 
            // but if it succeeds, it fixes RLS issues.
            supabase.from('profiles').upsert({
                id: bypassUser.id,
                full_name: bypassUser.user_metadata.full_name,
                role: 'admin',
                email: bypassUser.email
            }).then(({ error }) => {
                if (error) console.warn("Could not sync bypass profile, RLS might limit data view.", error);
                else console.log("Local Bypass Admin profile synchronized.");
            });

            return;
        }

        // 1. Check active session once on mount
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) await fetchRole(currentUser.id);
            setLoading(false);
        };
        initAuth();

        // 2. Subscribe to auth changes once
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                await fetchRole(currentUser.id);
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 3. Handle redirects in a separate effect
    useEffect(() => {
        if (loading) return;

        const isLoginPage = pathname === "/login";

        if (!user && !isLoginPage) {
            // Not logged in and not on login page -> go to login
            router.replace("/login");
        } else if (user && isLoginPage) {
            // Logged in and on login page -> go to dashboard
            router.replace("/dashboard");
        }
    }, [user, loading, pathname, router]);

    const logout = async () => {
        try {
            localStorage.removeItem("agrosense_admin_bypass");
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Sign out error:", err);
        } finally {
            setUser(null);
            setRole(null);
            setIsBypassed(false);
            router.replace("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, role, loading, logout }}>
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
