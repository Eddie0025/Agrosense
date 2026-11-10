"use client";

import { TrendingUp, TrendingDown, Minus, RefreshCcw, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { useRealTimeData } from "@/hooks/useRealTimeData";

const initialMarketData = [
    { crop: "Wheat", price: 2125, change: "+2.5%", trend: "up" },
    { crop: "Rice (Basmati)", price: 3450, change: "-1.2%", trend: "down" },
    { crop: "Maize", price: 1850, change: "+0.8%", trend: "up" },
    { crop: "Potato", price: 850, change: "0%", trend: "stable" },
    { crop: "Cotton", price: 5600, change: "+1.5%", trend: "up" },
    { crop: "Mustard", price: 4200, change: "-0.5%", trend: "down" },
];

export function MarketTicker() {
    const { data, isOffline } = useRealTimeData({
        key: 'market-prices',
        fetcher: async () => {
            // Simulate API fetch delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            // In a real app, fetch from AGMARKNET or Market API
            // For demo, we slightly jitter the prices to show "Real-time" movement
            return initialMarketData.map(item => ({
                ...item,
                price: item.price + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5)
            }));
        },
        refreshInterval: 60000 // Refresh every minute
    });

    const displayData = data || initialMarketData;

    return (
        <div className="bg-black/20 overflow-hidden relative group">
            <div className="flex items-center justify-between px-6 py-2 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", isOffline ? "bg-orange-500" : "bg-green-500 animate-pulse")} />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                        {isOffline ? "Viewing Cached Data" : "Live Market Feed"}
                    </span>
                </div>
                {!isOffline && <RefreshCcw size={10} className="text-muted animate-spin-slow" />}
            </div>

            <div className="py-4 relative">
                <div className="flex gap-12 animate-scroll whitespace-nowrap hover:[animation-play-state:paused]">
                    {[...displayData, ...displayData, ...displayData].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 min-w-[200px] cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                            <div>
                                <h4 className="font-bold text-white text-sm">{item.crop}</h4>
                                <p className="text-xs text-muted">₹ {item.price}/qt</p>
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${item.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                                item.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'
                                }`}>
                                {item.trend === 'up' ? <TrendingUp size={12} /> :
                                    item.trend === 'down' ? <TrendingDown size={12} /> :
                                        <Minus size={12} />}
                                {item.change}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-[#0f172a] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-[#0f172a] to-transparent pointer-events-none" />
            </div>
        </div>
    );
}

// Ensure cn is imported
import { cn } from "@/lib/utils";
