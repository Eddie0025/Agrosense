"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, Globe, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface Land {
    id: string;
    name: string;
    area_acres: number;
    location_city: string;
    soil_type: string;
    created_at?: string;
}

export function LandPortfolio() {
    const { user } = useAuth();
    const [lands, setLands] = useState<Land[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    const DEMO_LANDS: Land[] = [
        { id: 'demo-patiala', name: 'Patiala North Block (Demo)', area_acres: 5, location_city: 'Patiala', soil_type: 'Clayey' },
        { id: 'demo-rajpura', name: 'Rajpura South Block (Demo)', area_acres: 10, location_city: 'Rajpura', soil_type: 'Sandy' }
    ];

    // Form state
    const [newLand, setNewLand] = useState({
        name: "",
        acres: "",
        city: "",
        soil: "Alluvial"
    });

    const fetchLands = async (silent = false) => {
        if (!user) return;
        if (!silent) setIsLoading(true);
        const { data, error } = await supabase
            .from('farms')
            .select('*')
            .eq('owner_id', user.id);

        if (!error) {
            if (data && data.length > 0) {
                setLands(data);
                setIsDemoMode(false);
            } else {
                setLands(DEMO_LANDS);
                setIsDemoMode(true);
            }
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchLands();
    }, [user]);

    const handleAddLand = async () => {
        if (!newLand.name) {
            alert("Please enter a name for your farm.");
            return;
        }
        if (!newLand.acres) {
            alert("Please enter the total area in acres.");
            return;
        }
        if (!newLand.city) {
            alert("Please enter the city where the land is located.");
            return;
        }
        if (!user) return;

        setIsSaving(true);
        console.log("🚀 Starting land registration for:", newLand.name);

        try {
            // 1. Prepare Data (Sanitized)
            const landData = {
                owner_id: user.id,
                name: newLand.name.trim(),
                area_acres: parseFloat(newLand.acres) || 0,
                location_city: newLand.city.trim(),
                soil_type: newLand.soil
            };

            // 2. Database Action
            const { error, data } = await supabase
                .from('farms')
                .insert([landData])
                .select();

            if (error) throw error;

            console.log("✅ Land registered successfully:", data);

            // 3. UI Cleanup (Immediate)
            setNewLand({ name: "", acres: "", city: "", soil: "Alluvial" });
            setIsAdding(false);

            // 4. Refresh & Feedback
            await fetchLands(true);
            setTimeout(() => alert("✅ Success! '" + landData.name + "' has been added to your portfolio."), 100);

        } catch (error: any) {
            console.error("❌ Land Addition Failed:", error);
            alert(`❌ Error saving land: ${error.message || "Please check your internet connection and SQL patch."}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('farms')
            .delete()
            .eq('id', id);

        if (!error) {
            fetchLands();
        }
    };

    const handleLoadDemo = async () => {
        if (!user) return;
        setIsSaving(true);
        console.log("🚜 Pre-loading Demo Portfolio...");

        try {
            // 1. Create Patiala Land
            const { data: pLand, error: pErr } = await supabase.from('farms').insert([{
                owner_id: user.id,
                name: "Patiala North Block",
                area_acres: 5,
                location_city: "Patiala",
                soil_type: "Clayey"
            }]).select().single();
            if (pErr) throw pErr;

            // 2. Create Rajpura Land
            const { data: rLand, error: rErr } = await supabase.from('farms').insert([{
                owner_id: user.id,
                name: "Rajpura South Block",
                area_acres: 10,
                location_city: "Rajpura",
                soil_type: "Sandy"
            }]).select().single();
            if (rErr) throw rErr;

            // 3. Add Active Crop Cycles
            await supabase.from('crop_cycles').insert([
                { farm_id: pLand.id, owner_id: user.id, crop_name: "Wheat (PBW-343)", sowing_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), status: "active" },
                { farm_id: rLand.id, owner_id: user.id, crop_name: "Soybean (JS-335)", sowing_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), status: "active" }
            ]);

            await fetchLands(true);
            alert("✨ Demo Portfolio Pre-loaded! Patiala & Rajpura plots are now ready for presentation.");
        } catch (e: any) {
            console.error("❌ Demo Pre-load Failed:", e);
            alert("❌ Failed to pre-load demo data: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Globe className="text-accent" size={24} />
                        My Land Portfolio
                    </h2>
                    {isDemoMode && (
                        <span className="px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-black uppercase tracking-widest rounded-md border border-accent/30 animate-pulse">
                            Demo Presentation Mode
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="p-2 bg-accent/20 text-accent hover:bg-accent hover:text-white rounded-xl transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-accent/10"
                    >
                        <Plus size={18} /> Add Land
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {lands.map((land) => (
                        <motion.div
                            key={land.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass-panel p-5 rounded-2xl border border-white/5 group hover:border-accent/30 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none" />

                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-white text-lg">{land.name}</h3>
                                    <div className="flex items-center gap-2 text-muted text-xs">
                                        <MapPin size={14} className="text-accent" />
                                        {land.location_city}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted text-xs mt-1">
                                        <Ruler size={14} className="text-blue-400" />
                                        {land.area_acres} Acres
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(land.id)}
                                    className="p-2 text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase font-bold text-muted tracking-wider">
                                    {land.soil_type} Soil
                                </span>
                                <span className="px-3 py-1 bg-green-500/10 rounded-full text-[10px] uppercase font-bold text-green-400 tracking-wider">
                                    Active
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {lands.length === 0 && !isLoading && !isAdding && (
                    <div className="col-span-full py-12 text-center glass-panel rounded-3xl border-dashed border-white/10">
                        <p className="text-muted italic">No land holdings registered yet.</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="mt-4 text-accent font-bold hover:underline"
                        >
                            + Register your first farm
                        </button>
                    </div>
                )}
            </div>

            {/* Add Land Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md glass-panel p-8 rounded-[2rem] border border-white/10 shadow-3xl overflow-hidden bg-[#0a0f1e]"
                        >
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight flex items-center gap-2">
                                <Plus className="text-accent" size={24} /> Register New Land
                            </h3>
                            <p className="text-xs text-muted mb-8 italic">Specify your field details for location-aware AI advisory.</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-white uppercase tracking-widest ml-1 opacity-70">1. Farm / Plot Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Patiala East Block"
                                        className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent transition-all shadow-inner"
                                        value={newLand.name}
                                        onChange={e => setNewLand({ ...newLand, name: e.target.value })}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), e.stopPropagation())}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-white uppercase tracking-widest ml-1 opacity-70">2. Location / City</label>
                                        <input
                                            type="text"
                                            placeholder="Patiala"
                                            className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent transition-all shadow-inner"
                                            value={newLand.city}
                                            onChange={e => setNewLand({ ...newLand, city: e.target.value })}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), e.stopPropagation())}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-white uppercase tracking-widest ml-1 opacity-70">3. Area (Acres)</label>
                                        <input
                                            type="number"
                                            placeholder="5"
                                            className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-accent transition-all shadow-inner"
                                            value={newLand.acres}
                                            onChange={e => setNewLand({ ...newLand, acres: e.target.value })}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), e.stopPropagation())}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-white uppercase tracking-widest ml-1 opacity-70">4. Soil Type</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-black/50 border border-white/20 p-4 rounded-xl text-white outline-none focus:border-accent ring-0 transition-all cursor-pointer"
                                            value={newLand.soil}
                                            onChange={e => setNewLand(prev => ({ ...prev, soil: e.target.value }))}
                                        >
                                            <option value="Alluvial" className="bg-[#0a0f1e]">Alluvial (Common in Punjab)</option>
                                            <option value="Clayey" className="bg-[#0a0f1e]">Clayey (Retains Water)</option>
                                            <option value="Sandy" className="bg-[#0a0f1e]">Sandy (Needs more Water)</option>
                                            <option value="Black" className="bg-[#0a0f1e]">Black Soil (Rich)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-accent">
                                            <Plus size={16} className="rotate-45" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-10">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="py-4 bg-white/5 text-white/50 rounded-xl font-bold hover:bg-white/10 hover:text-white transition-all text-xs uppercase tracking-widest"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddLand}
                                    disabled={isSaving}
                                    className="py-4 bg-accent text-accent-foreground rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="animate-spin text-lg">⟳</span>
                                            Saving...
                                        </>
                                    ) : (
                                        "Confirm & Add Land"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
