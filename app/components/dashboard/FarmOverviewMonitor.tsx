"use client";

import { useState, useEffect } from "react";
import { Cloud, Thermometer, Droplets, Sprout, MapPin, Ruler, Activity, Wind } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface farm_status {
    id: string;
    name: string;
    location_city: string;
    area_acres: number;
    soil_type: string;
    active_crop?: {
        name: string;
        sowing_date: string;
        stage: string;
        progress: number;
    };
    weather?: {
        temp: number;
        condition: string;
        humidity: number;
    };
}

export function FarmOverviewMonitor() {
    const { user } = useAuth();
    const [farms, setFarms] = useState<farm_status[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const calculateCropStage = (sowingDate: string, cropName: string) => {
        const start = new Date(sowingDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        // Simple stage mapping for demo purposes (optimized for Wheat/General)
        if (diffDays < 0) return { stage: "Planned", progress: 0 };
        if (diffDays <= 10) return { stage: "Germination", progress: 10 };
        if (diffDays <= 25) return { stage: "Seedling", progress: 25 };
        if (diffDays <= 45) return { stage: "Tillering", progress: 45 };
        if (diffDays <= 75) return { stage: "Stem Elongation", progress: 65 };
        if (diffDays <= 90) return { stage: "Heading", progress: 80 };
        if (diffDays <= 110) return { stage: "Flowering", progress: 90 };
        return { stage: "Ripening", progress: 100 };
    };

    const fetchFarmData = async () => {
        if (!user) return;
        setIsLoading(true);

        // 1. Fetch Farms
        const { data: farmsData, error: farmsError } = await supabase
            .from('farms')
            .select('*')
            .eq('owner_id', user.id);

        if (farmsError) {
            console.error("Error fetching farms:", farmsError);
            setIsLoading(false);
            return;
        }

        let farmsToProcess = farmsData || [];

        // Fallback to Demo Data if empty
        if (farmsToProcess.length === 0) {
            console.log("ℹ️ No farms found. Using hardcoded demo lands for presentation.");
            farmsToProcess = [
                { id: 'demo-patiala', name: 'Patiala North Block (Demo)', area_acres: 5, location_city: 'Patiala', soil_type: 'Clayey' },
                { id: 'demo-rajpura', name: 'Rajpura South Block (Demo)', area_acres: 10, location_city: 'Rajpura', soil_type: 'Sandy' }
            ];
        }

        // 2. Fetch Active Crop Cycles (skip if demo)
        const farmIds = farmsToProcess.map(f => f.id);
        const { data: cyclesData } = await supabase
            .from('crop_cycles')
            .select('*')
            .in('farm_id', farmIds)
            .eq('status', 'active');

        // Mock demo cycles if needed
        const processedCycles = cyclesData || [];
        if (processedCycles.length === 0 && farmsToProcess[0]?.id === 'demo-patiala') {
            processedCycles.push(
                { farm_id: 'demo-patiala', crop_name: 'Wheat (PBW-343)', sowing_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
                { farm_id: 'demo-rajpura', crop_name: 'Soybean (JS-335)', sowing_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() }
            );
        }

        // 3. Merge and Mock Weather
        const enrichedFarms: farm_status[] = farmsToProcess.map(farm => {
            const activeCycle = processedCycles.find(c => c.farm_id === farm.id);
            const cycleStatus = activeCycle ? calculateCropStage(activeCycle.sowing_date, activeCycle.crop_name) : null;

            return {
                ...farm,
                active_crop: activeCycle ? {
                    name: activeCycle.crop_name,
                    sowing_date: activeCycle.sowing_date,
                    stage: cycleStatus?.stage || "N/A",
                    progress: cycleStatus?.progress || 0
                } : undefined,
                weather: {
                    temp: 24 + Math.floor(Math.random() * 8), // Mock local temp
                    condition: ["Sunny", "Partly Cloudy", "Clear"][Math.floor(Math.random() * 3)],
                    humidity: 45 + Math.floor(Math.random() * 20)
                }
            };
        });

        setFarms(enrichedFarms);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchFarmData();
    }, [user]);

    if (isLoading) return <div className="text-center py-20 animate-pulse text-muted">Scanning field sensors...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 italic uppercase tracking-tighter">
                    <Activity className="text-accent" size={24} />
                    Live Field Monitoring
                </h2>
                <span className="text-[10px] font-black text-muted uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    {farms.length} Active Plots
                </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {farms.map((farm) => (
                        <motion.div
                            key={farm.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group hover:border-accent/30 transition-all bg-[#0a0f1e]/40 shadow-2xl"
                        >
                            {/* Accent Glow */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-[60px] -mr-24 -mt-24 pointer-events-none group-hover:bg-accent/10 transition-colors" />

                            <div className="relative z-10 space-y-6">
                                {/* Farm Header */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tight">{farm.name}</h3>
                                        <div className="flex items-center gap-2 text-muted text-xs mt-1 font-bold">
                                            <MapPin size={14} className="text-accent" />
                                            {farm.location_city}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-white font-black text-xl">
                                            <Thermometer size={18} className="text-orange-400" />
                                            {farm.weather?.temp}°C
                                        </div>
                                        <p className="text-[10px] text-muted font-black uppercase tracking-widest">{farm.weather?.condition}</p>
                                    </div>
                                </div>

                                {/* Crop Progress */}
                                {farm.active_crop ? (
                                    <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Current Crop</p>
                                                <h4 className="font-bold text-white flex items-center gap-2">
                                                    <Sprout size={16} className="text-green-400" />
                                                    {farm.active_crop.name}
                                                </h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Growth Stage</p>
                                                <span className="text-xs font-bold text-accent px-2 py-1 bg-accent/10 rounded-lg">{farm.active_crop.stage}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${farm.active_crop.progress}%` }}
                                                    className="h-full bg-gradient-to-r from-accent to-emerald-400"
                                                />
                                            </div>
                                            <div className="flex justify-between text-[9px] font-black text-muted uppercase tracking-widest">
                                                <span>Sown: {new Date(farm.active_crop.sowing_date).toLocaleDateString()}</span>
                                                <span>{farm.active_crop.progress}% Est. Progress</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-black/20 rounded-2xl border border-dashed border-white/10">
                                        <p className="text-xs text-muted italic font-medium">No active crop cycle detected for this plot.</p>
                                        <button className="text-[10px] font-black text-accent uppercase tracking-widest mt-2 hover:underline">
                                            + Start Sowing
                                        </button>
                                    </div>
                                )}

                                {/* Environmental Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                        <Ruler size={16} className="text-blue-400 mx-auto mb-1" />
                                        <p className="text-[9px] text-muted font-black uppercase tracking-widest">Acreage</p>
                                        <p className="text-sm font-bold text-white">{farm.area_acres} Ac</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                        <Droplets size={16} className="text-emerald-400 mx-auto mb-1" />
                                        <p className="text-[9px] text-muted font-black uppercase tracking-widest">Humidity</p>
                                        <p className="text-sm font-bold text-white">{farm.weather?.humidity}%</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                        <Wind size={16} className="text-purple-400 mx-auto mb-1" />
                                        <p className="text-[9px] text-muted font-black uppercase tracking-widest">Soil Type</p>
                                        <p className="text-sm font-bold text-white truncate px-1">{farm.soil_type}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
