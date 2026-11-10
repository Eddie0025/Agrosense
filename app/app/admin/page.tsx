"use client";

import { useState, useEffect } from "react";
import {
    Users,
    MessageSquare,
    Sparkles,
    TrendingUp,
    ShieldAlert,
    Search,
    Download,
    Eye,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface AILog {
    id: string;
    query_text: string;
    response_text: string;
    created_at: string;
    user_id: string;
    profiles: { full_name: string } | null;
}

export default function AdminPage() {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    const [logs, setLogs] = useState<AILog[]>([]);
    const [stats, setStats] = useState({
        users: 0,
        posts: 0,
        aiQueries: 0
    });
    const [marketOverrides, setMarketOverrides] = useState([
        { crop: "Wheat", price: 2125, change: "+1.2%" },
        { crop: "Potato", price: 1450, change: "-0.5%" },
        { crop: "Rice", price: 3400, change: "+2.1%" }
    ]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user || role !== 'admin') {
                router.push("/dashboard");
            } else {
                fetchAdminData();
            }
        }
    }, [user, role, loading, router]);

    const fetchAdminData = async () => {
        setIsRefreshing(true);

        // Fetch Logs with Profile Info
        const { data: logData } = await supabase
            .from('ai_logs')
            .select(`
                *,
                profiles(full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (logData) setLogs(logData as any);

        // Fetch Stats
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
        const { count: aiCount } = await supabase.from('ai_logs').select('*', { count: 'exact', head: true });

        setStats({
            users: userCount || 0,
            posts: postCount || 0,
            aiQueries: aiCount || 0
        });

        setIsRefreshing(false);
    };

    if (loading || role !== 'admin') return null;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                        <ShieldAlert className="text-red-400" /> Platform Administration
                    </h1>
                    <p className="text-muted text-sm">Monitor system health, AI responses, and mandi market data.</p>
                </div>
                <button
                    onClick={fetchAdminData}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-bold"
                >
                    {isRefreshing ? "Refreshing..." : "Fresh Sync"}
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Community Posts", value: stats.posts, icon: MessageSquare, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "AI Consultations", value: stats.aiQueries, icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10" },
                    { label: "System Status", value: "Healthy", icon: CheckCircle2, color: "text-yellow-400", bg: "bg-yellow-500/10" },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl hover:scale-105 transition-transform"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={22} />
                            </div>
                            <span className="text-xs font-bold text-muted uppercase tracking-widest">Real-time</span>
                        </div>
                        <p className="text-sm text-muted mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AI Monitoring Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Search size={18} className="text-accent" /> AI Advisor Quality Control
                            </h3>
                            <button className="p-2 hover:bg-white/10 rounded-lg text-muted transition-colors">
                                <Download size={18} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5">
                                        <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">User</th>
                                        <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Query Snippet</th>
                                        <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Time</th>
                                        <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                                                        {log.profiles?.full_name?.[0] || 'U'}
                                                    </div>
                                                    <span className="text-sm text-white font-medium">{log.profiles?.full_name || 'Anonymous'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-gray-400 line-clamp-1 italic">"{log.query_text}"</p>
                                            </td>
                                            <td className="p-4 text-xs text-muted">
                                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-4">
                                                <button className="p-2 bg-white/5 rounded-lg text-accent hover:bg-accent hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Mandi Market Manual Control */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl -mr-16 -mt-16 group-hover:bg-accent/20 transition-colors" />
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="text-accent" /> Mandi Rates (Override)
                        </h3>

                        <div className="space-y-4">
                            {marketOverrides.map((item) => (
                                <div key={item.crop} className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-white">{item.crop}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-100'}`}>
                                            {item.change}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs font-bold">₹</span>
                                            <input
                                                type="number"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-6 py-2 text-white font-bold text-sm outline-none focus:border-accent/50"
                                                defaultValue={item.price}
                                            />
                                        </div>
                                        <button className="px-3 bg-accent text-accent-foreground rounded-xl font-bold text-xs hover:scale-105 transition-transform">
                                            Update
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <div className="flex gap-3">
                                <ShieldAlert size={18} className="text-red-400 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-red-100 uppercase tracking-tighter mb-1">Warning</p>
                                    <p className="text-[10px] text-red-200/60 leading-tight">These changes update the mandi rates for all users instantly on their dashboard.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
