"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CloudSun,
    Sprout,
    Users,
    Calendar,
    BookOpen,
    BadgeIndianRupee,
    MessageSquare,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Leaf,
    Landmark,
    BarChart3,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Economics", href: "/economics", icon: BadgeIndianRupee },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Community", href: "/community", icon: Users },
    { name: "Schemes", href: "/schemes", icon: Landmark },
    { name: "Knowledge", href: "/knowledge", icon: BookOpen },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "AI Advisor", href: "/advisor", icon: MessageSquare },
];

export function Sidebar({
    className,
    onClose,
    isCollapsed,
    toggleCollapse
}: {
    className?: string;
    onClose?: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}) {
    const pathname = usePathname();
    const { logout, user, role } = useAuth();

    const displayNavItems = role === 'admin'
        ? [...navItems, { name: "Admin Panel", href: "/admin", icon: ShieldAlert }]
        : navItems;

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className={cn(
                "h-screen fixed left-0 top-0 z-40 flex flex-col glass-panel border-r border-white/10 transition-all duration-300",
                className
            )}
        >
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 relative">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
                        <Leaf className="text-white w-6 h-6" />
                    </div>
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="font-bold text-xl text-white tracking-tight whitespace-nowrap"
                            >
                                AgroSense
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Collapse Toggle (Desktop Only) */}
                <button
                    onClick={toggleCollapse}
                    className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-card border border-white/10 rounded-full items-center justify-center text-muted hover:text-white transition-colors shadow-md z-50"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                {displayNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center rounded-xl transition-all duration-200 group relative",
                                isCollapsed ? "justify-center px-3 py-3" : "gap-3 px-3 py-3",
                                isActive
                                    ? "bg-accent/10 text-accent"
                                    : "text-muted hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon size={22} className={cn("shrink-0 transition-colors", isActive ? "text-accent" : "group-hover:text-accent")} />

                            {!isCollapsed && (
                                <span className="font-medium whitespace-nowrap">
                                    {item.name}
                                </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 bg-card border border-white/10 rounded-lg text-xs text-white font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                                    {item.name}
                                </div>
                            )}

                            {isActive && !isCollapsed && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            )}

                            {isActive && isCollapsed && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-t-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <Link href="/profile" className={cn(
                    "flex items-center hover:bg-white/5 p-2 rounded-xl transition-colors group relative",
                    isCollapsed ? "justify-center" : "gap-3"
                )}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                        {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                    </div>

                    {!isCollapsed && (
                        <div>
                            <p className="text-sm font-semibold text-white truncate">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Guest"}</p>
                            <p className="text-xs text-muted truncate">{user?.email ? "Authenticated Farmer" : "Guest"}</p>
                        </div>
                    )}

                    {/* Tooltip for collapsed profile */}
                    {isCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-card border border-white/10 rounded-lg text-xs text-white font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                            Profile Settings
                        </div>
                    )}
                </Link>

                <button
                    onClick={logout}
                    className={cn(
                        "mt-4 flex items-center w-full py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors group relative",
                        isCollapsed ? "justify-center px-2" : "justify-center gap-2 px-4"
                    )}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="font-medium text-sm">Log Out</span>}

                    {/* Tooltip for collapsed logout */}
                    {isCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-card border border-white/10 rounded-lg text-xs text-white font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                            Log Out
                        </div>
                    )}
                </button>
            </div>
        </motion.aside>
    );
}
