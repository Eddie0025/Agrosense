"use client";

import { useState } from "react";
import { AlertTriangle, CloudRain, Sprout, Bug, Droplets, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ALL_ALERTS = [
    {
        id: 1,
        title: "Yellow Rust Alert",
        description: "High humidity detected. Favorable conditions for Yellow Rust in Wheat. Inspect field immediately.",
        icon: Bug,
        color: "red",
        time: "2h ago"
    },
    {
        id: 2,
        title: "Rain Forecast",
        description: "Heavy rain expected in 48 hours. Delay any planned irrigation or fertilizer application.",
        icon: CloudRain,
        color: "yellow",
        time: "5h ago"
    },
    {
        id: 3,
        title: "Low Soil Moisture",
        description: "Sector 4 moisture levels dropped below 15%. Recommend 20-minute irrigation cycle tonight.",
        icon: Droplets,
        color: "blue",
        time: "10h ago"
    },
    {
        id: 4,
        title: "Pest Activity",
        description: "Pheromone traps in neighboring farms showing increased fall armyworm activity.",
        icon: Bug,
        color: "orange",
        time: "Yesterday"
    },
    {
        id: 5,
        title: "Market Volatility",
        description: "Wheat prices expected to dip by 5-8% next week due to surplus arrival from Punjab.",
        icon: TrendingDown,
        color: "red",
        time: "Yesterday"
    }
];

export function RiskCards() {
    const [isExpanded, setIsExpanded] = useState(false);
    const displayedAlerts = isExpanded ? ALL_ALERTS : ALL_ALERTS.slice(0, 2);

    return (
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-red-500/20 rounded-lg animate-pulse">
                    <AlertTriangle className="text-red-500" size={18} />
                </div>
                AI Risk Radar
            </h3>

            <div className="flex-1 space-y-4 overflow-hidden">
                <AnimatePresence initial={false}>
                    {displayedAlerts.map((alert, index) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            className={cn(
                                "glass-card p-4 rounded-xl flex items-start gap-4 border-l-4",
                                alert.color === 'red' ? "border-l-red-500" :
                                    alert.color === 'yellow' ? "border-l-yellow-500" :
                                        alert.color === 'orange' ? "border-l-orange-400" : "border-l-blue-500"
                            )}
                        >
                            <div className="mt-1">
                                <alert.icon
                                    size={20}
                                    className={cn(
                                        alert.color === 'red' ? "text-red-400" :
                                            alert.color === 'yellow' ? "text-yellow-400" :
                                                alert.color === 'orange' ? "text-orange-300" : "text-blue-400"
                                    )}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-white font-bold text-sm">{alert.title}</h4>
                                    <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                                </div>
                                <p className="text-xs text-muted mt-1 leading-relaxed">{alert.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <div className="mt-auto pt-4 border-t border-white/5 text-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs text-accent font-semibold hover:underline flex items-center gap-1 mx-auto transition-all"
                    >
                        {isExpanded ? (
                            <>Show Less Alerts <ChevronUp size={14} /></>
                        ) : (
                            <>View All {ALL_ALERTS.length} Alerts <ChevronDown size={14} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
