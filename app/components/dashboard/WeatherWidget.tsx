"use client";

import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { useRealTimeData } from "@/hooks/useRealTimeData";

interface WeatherData {
    temperature: number;
    windspeed: number;
    condition: string;
    humidity: number;
    rain: number;
}

export function WeatherWidget() {
    const { data, loading, isOffline } = useRealTimeData<WeatherData>({
        key: 'weather',
        fetcher: async () => {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=30.9010&longitude=75.8573&current_weather=true&hourly=relativehumidity_2m,precipitation');
            const json = await res.json();

            // Map condition codes to text (simpler for this demo)
            const code = json.current_weather.weathercode;
            let condition = "Clear";
            if (code > 0 && code < 45) condition = "Cloudy";
            if (code >= 45 && code < 60) condition = "Foggy";
            if (code >= 60) condition = "Rainy";

            return {
                temperature: Math.round(json.current_weather.temperature),
                windspeed: json.current_weather.windspeed,
                condition: condition,
                humidity: 65, // Simplified
                rain: 0 // Simplified
            };
        }
    });

    if (loading && !data) return <div className="h-64 animate-pulse bg-white/5 rounded-2xl flex items-center justify-center text-muted">Connecting to satellite...</div>;

    const displayData = data || { temperature: 0, windspeed: 0, condition: "Unknown", humidity: 0, rain: 0 };

    return (
        <div className="p-8 relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-sm font-semibold text-accent uppercase tracking-wider">Live Weather</h2>
                        {isOffline && (
                            <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-orange-500/20">
                                <WifiOff size={10} /> Saved Data
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Ludhiana</h1>
                    <p className="text-muted text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                </div>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                >
                    {displayData.condition === "Rainy" ? <CloudRain size={64} /> : <Sun size={64} />}
                </motion.div>
            </div>

            <div className="mt-8 flex items-end gap-4 relative z-10">
                <span className="text-7xl font-bold text-white tracking-tighter">{displayData.temperature}°</span>
                <span className="text-xl text-muted mb-4 font-medium">{displayData.condition}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 relative z-10">
                <div className="flex items-center gap-2">
                    <Wind size={18} className="text-blue-400" />
                    <span className="text-sm text-gray-300">{displayData.windspeed} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                    <Droplets size={18} className="text-blue-400" />
                    <span className="text-sm text-gray-300">{displayData.humidity}% Hum</span>
                </div>
                <div className="flex items-center gap-2">
                    <CloudRain size={18} className="text-blue-400" />
                    <span className="text-sm text-gray-300">{displayData.rain}% Rain</span>
                </div>
            </div>

            {/* Background Gradient Blob */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-yellow-500/20 transition-all duration-700"></div>
        </div>
    );
}
