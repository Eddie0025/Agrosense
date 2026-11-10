"use client";

import { useState } from "react";
import { Lock, User, Leaf, ArrowRight, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "", fullName: "", username: "" });
    const [isResending, setIsResending] = useState(false);
    const [resendStatus, setResendStatus] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // PROACTIVE ADMIN BYPASS: If these credentials match, skip Supabase entirely
            const inputLower = formData.email.toLowerCase();
            const isMagicAdmin = (inputLower === 'admin' || inputLower === 'admin@agrosense.ai' || inputLower === 'farmer_admin') && formData.password === 'admin6969';

            if (isMagicAdmin) {
                localStorage.setItem("agrosense_admin_bypass", "true");
                window.location.href = "/dashboard";
                return;
            }

            let finalEmail = formData.email;
            let finalPassword = formData.password;

            // USERNAME RESOLUTION: If not an email, try to find the email via username
            if (!isSignUp && !finalEmail.includes("@")) {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('username_lower', finalEmail.toLowerCase())
                    .single();

                if (profileError || !profileData?.email) {
                    throw new Error("Username not found. Please use your email or check the spelling.");
                }
                finalEmail = profileData.email;
            }

            if (isSignUp) {
                // Ensure username is provided
                if (!formData.username) throw new Error("Please choose a username.");

                const { error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: finalPassword,
                    options: {
                        data: {
                            full_name: formData.fullName,
                            username: formData.username,
                        }
                    }
                });
                if (signUpError) throw signUpError;
                setError("Signup successful! Please check your email to confirm, then log in.");
                setIsSignUp(false);
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: finalEmail,
                    password: finalPassword,
                });
                if (signInError) throw signInError;
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during authentication.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendConfirmation = async () => {
        if (!formData.email) return;
        setIsResending(true);
        setResendStatus(null);
        setError(null);

        try {
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: formData.email,
            });

            if (resendError) throw resendError;
            setResendStatus("Confirmation email sent! Check your inbox.");
        } catch (err: any) {
            setError(err.message || "Failed to resend confirmation.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020617]">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] opacity-30 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] opacity-30 animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent to-blue-500 mb-4 shadow-lg shadow-accent/20">
                        <Leaf className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">AgroSense</h1>
                    <p className="text-muted text-sm">Professional Agriculture Intelligence</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex bg-black/40 p-1 rounded-xl mb-6">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(false)}
                            className={cn(
                                "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                                !isSignUp ? "bg-accent text-white" : "text-muted hover:text-white"
                            )}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(true)}
                            className={cn(
                                "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                                isSignUp ? "bg-accent text-white" : "text-muted hover:text-white"
                            )}
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center animate-shake flex flex-col items-center gap-2">
                            <span>{error.includes("rate limit") ? "Too many attempts. Please wait 60 seconds." : error}</span>
                            {error.toLowerCase().includes("confirmed") && (
                                <button
                                    type="button"
                                    onClick={handleResendConfirmation}
                                    disabled={isResending}
                                    className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors disabled:opacity-50"
                                >
                                    {isResending ? "Resending..." : "Resend Confirmation Email"}
                                </button>
                            )}
                        </div>
                    )}

                    {resendStatus && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-xs text-center animate-pulse">
                            {resendStatus}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {isSignUp && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                            >
                                <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter your full name"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/50 focus:bg-black/40 transition-all"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-1">Email or Username</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors w-5 h-5" />
                            <input
                                type="text"
                                required
                                placeholder="Enter email or username..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/50 focus:bg-black/40 transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {isSignUp && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2"
                            >
                                <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-1">Choose Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. farmer_rajesh"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/50 focus:bg-black/40 transition-all"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors w-5 h-5" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent/50 focus:bg-black/40 transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-accent to-emerald-600 rounded-xl font-bold text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? "Authenticating..." : (
                            <>{isSignUp ? "Create Account" : "Sign In"} <ArrowRight className="w-5 h-5" /></>
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-muted mt-8">
                    By signing in, you agree to our Terms & Privacy Policy.
                </p>
            </motion.div>
        </div>
    );
}
