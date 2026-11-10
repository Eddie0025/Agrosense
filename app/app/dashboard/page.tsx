"use client";

import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { MarketTicker } from "@/components/dashboard/MarketTicker";
import { RiskCards } from "@/components/dashboard/RiskCards";
import { FarmOverviewMonitor } from "@/components/dashboard/FarmOverviewMonitor";
import { TrendingUp, Droplets, Sprout } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="space-y-8 pb-12">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-white/5">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                        <Droplets size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Water Saved</p>
                        <h3 className="text-2xl font-bold text-white tracking-tight">1.2M L <span className="text-xs text-green-400 font-normal ml-1">(+12%)</span></h3>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-white/5">
                    <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                        <Sprout size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Active Crops</p>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Wheat, Potato</h3>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-white/5">
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Est. Revenue</p>
                        <h3 className="text-2xl font-bold text-white tracking-tight">₹ 4.2 Lakh</h3>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Farm Overview Monitor Section (NEW) */}
                    <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-blue-500 to-transparent opacity-50" />
                        <FarmOverviewMonitor />
                    </div>

                    <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 bg-[#020617]/40">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                            <h2 className="font-bold text-white text-sm uppercase tracking-widest opacity-80">Live Market Intelligence</h2>
                        </div>
                        <MarketTicker />
                    </div>

                    <div className="glass-card rounded-2xl p-1 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <WeatherWidget />
                    </div>
                </div>

                {/* Right Column (1/3) */}
                <div className="h-full">
                    <RiskCards />
                </div>
            </div>
        </div>
    );
}
