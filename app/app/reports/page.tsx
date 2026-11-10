"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { TrendingUp, Sprout, BadgeIndianRupee } from "lucide-react";

const yieldData = [
    { year: "2021", wheat: 1.8, rice: 2.4 },
    { year: "2022", wheat: 1.9, rice: 2.5 },
    { year: "2023", wheat: 2.1, rice: 2.6 },
    { year: "2024", wheat: 2.0, rice: 2.4 }, // Bad weather year mock
    { year: "2025", wheat: 2.3, rice: 2.8 },
];

const profitData = [
    { year: "2021", profit: 1.2 },
    { year: "2022", profit: 1.4 },
    { year: "2023", profit: 1.8 },
    { year: "2024", profit: 1.5 },
    { year: "2025", profit: 2.2 },
];

export default function ReportsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Farm Reports</h1>
                <p className="text-muted">Historical analysis of your yields and financial performance.</p>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-l-4 border-l-accent">
                    <div className="p-3 bg-accent/10 rounded-full text-accent">
                        <BadgeIndianRupee size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-muted uppercase font-bold">Total Profit (2025)</p>
                        <h3 className="text-2xl font-bold text-white">₹ 2.2 Lakh</h3>
                        <p className="text-xs text-green-400 font-bold flex items-center gap-1">
                            <TrendingUp size={10} /> +46% vs 2024
                        </p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-l-4 border-l-blue-500">
                    <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
                        <Sprout size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-muted uppercase font-bold">Record Yield</p>
                        <h3 className="text-2xl font-bold text-white">2.3 Tons/Ac</h3>
                        <p className="text-xs text-gray-400">Wheat (Winter '25)</p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Yield History */}
                <div className="glass-panel p-6 rounded-3xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-6">Yield Trends (Tons/Acre)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yieldData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="wheat" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e' }} name="Wheat" />
                                <Line type="monotone" dataKey="rice" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} name="Rice" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit Data */}
                <div className="glass-panel p-6 rounded-3xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-6">Annual Net Profit (Lakhs ₹)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={profitData}>
                                <defs>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                    formatter={(value) => [`₹ ${value} L`]}
                                />
                                <Area type="monotone" dataKey="profit" stroke="#22c55e" fillOpacity={1} fill="url(#colorProfit)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
