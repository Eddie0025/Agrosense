"use client";

import { useState, useEffect } from "react";
import { ArrowRight, DollarSign, Sprout, Calculator, ArrowLeft, Users, Waves, Package, PlusCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MiscCost {
    id: string;
    label: string;
    amount: number;
}

export function EstimatorWizard() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        crop: "Wheat",
        area: 5, // acres
        seedCost: 0,
        fertCost: 0,
        laborCost: 0, // Now required input
    });
    const [miscCosts, setMiscCosts] = useState<MiscCost[]>([]);

    const [result, setResult] = useState<{
        yield: number;
        revenue: number;
        costBreakdown: {
            seeds: number;
            fertilizers: number;
            labor: number;
            misc: number;
            total: number;
        };
        profit: number;
        roi: number;
    } | null>(null);

    // Default estimates per acre
    const defaultEstimates: Record<string, { seeds: number; fert: number }> = {
        Wheat: { seeds: 1200, fert: 2500 },
        Rice: { seeds: 1500, fert: 3000 },
        Maize: { seeds: 1800, fert: 2800 },
        Potato: { seeds: 15000, fert: 8000 }
    };

    const marketPrices: Record<string, number> = {
        Wheat: 2125,
        Rice: 3450,
        Maize: 1850,
        Potato: 850
    };

    // Auto-update estimates when crop or area changes
    useEffect(() => {
        const est = defaultEstimates[formData.crop];
        if (est) {
            setFormData(prev => ({
                ...prev,
                seedCost: est.seeds * prev.area,
                fertCost: est.fert * prev.area
            }));
        }
    }, [formData.crop, formData.area]);

    const addMiscCost = () => {
        setMiscCosts([...miscCosts, { id: Math.random().toString(36).substr(2, 9), label: "", amount: 0 }]);
    };

    const removeMiscCost = (id: string) => {
        setMiscCosts(miscCosts.filter(cost => cost.id !== id));
    };

    const updateMiscCost = (id: string, field: 'label' | 'amount', value: string | number) => {
        setMiscCosts(miscCosts.map(cost =>
            cost.id === id ? { ...cost, [field]: value } : cost
        ));
    };

    const handleCalculate = () => {
        const baseYield = { Wheat: 2.2, Rice: 2.8, Maize: 3.0, Potato: 12.0 }[formData.crop] || 2.0;
        const predictedYield = baseYield * formData.area * (0.95 + Math.random() * 0.1);

        const totalMisc = miscCosts.reduce((sum, cost) => sum + cost.amount, 0);
        const totalCost = formData.seedCost + formData.fertCost + formData.laborCost + totalMisc;

        const price = marketPrices[formData.crop] || 2000;
        const revenue = predictedYield * price * 10; // tons * price_per_quintal * 10
        const profit = revenue - totalCost;
        const roi = (profit / totalCost) * 100;

        setResult({
            yield: parseFloat(predictedYield.toFixed(2)),
            revenue: parseFloat(revenue.toFixed(2)),
            costBreakdown: {
                seeds: formData.seedCost,
                fertilizers: formData.fertCost,
                labor: formData.laborCost,
                misc: totalMisc,
                total: totalCost
            },
            profit: parseFloat(profit.toFixed(2)),
            roi: parseFloat(roi.toFixed(1))
        });
        setStep(2);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-10 relative">
                <div className="absolute w-64 h-1 bg-white/10 rounded-full z-0">
                    <motion.div
                        className="h-full bg-accent rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: step === 2 ? "100%" : "0%" }}
                    />
                </div>
                <div className="flex justify-between w-64 relative z-10">
                    {[1, 2].map((i) => (
                        <div key={i} className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-xl transition-all duration-500",
                            step >= i ? 'bg-accent text-accent-foreground scale-110 shadow-accent/20' : 'bg-card text-muted border border-white/10'
                        )}>{i}</div>
                    ))}
                </div>
            </div>

            <div className="glass-panel border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <div className="p-3 bg-accent/20 rounded-xl text-accent"><Calculator size={24} /></div>
                                Cost Estimator
                            </h2>
                            <div className="bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
                                <span className="text-accent text-xs font-bold uppercase tracking-widest">Economics Section</span>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Primary Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-muted uppercase tracking-wider ml-1">Select Crop</label>
                                    <select
                                        className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors"
                                        value={formData.crop}
                                        onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                                    >
                                        {Object.keys(marketPrices).map(c => <option key={c} className="bg-gray-900">{c}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-muted uppercase tracking-wider ml-1">Farm Area (Acres)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors"
                                        value={formData.area || ""}
                                        onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            {/* Core Costs */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider ml-1">
                                        <Package size={14} className="text-accent" /> Seeds (₹)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors"
                                        value={formData.seedCost || ""}
                                        onChange={(e) => setFormData({ ...formData, seedCost: parseFloat(e.target.value) || 0 })}
                                    />
                                    <p className="text-[10px] text-muted-foreground ml-1 italic">* Estimated by software</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider ml-1">
                                        <Waves size={14} className="text-accent" /> Fertilizers (₹)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors"
                                        value={formData.fertCost || ""}
                                        onChange={(e) => setFormData({ ...formData, fertCost: parseFloat(e.target.value) || 0 })}
                                    />
                                    <p className="text-[10px] text-muted-foreground ml-1 italic">* Estimated by software</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider ml-1">
                                        <Users size={14} className="text-accent" /> Labour Cost (₹)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Required input"
                                        className="w-full bg-accent/5 border border-accent/20 p-4 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors shadow-inner"
                                        value={formData.laborCost || ""}
                                        onChange={(e) => setFormData({ ...formData, laborCost: parseFloat(e.target.value) || 0 })}
                                    />
                                    <p className="text-[10px] text-accent/70 ml-1 font-bold">! Enter actual labor cost</p>
                                </div>
                            </div>

                            {/* Miscellaneous Costs */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Miscellaneous Costs (Optional)</h3>
                                    <button
                                        onClick={addMiscCost}
                                        className="text-xs text-accent hover:text-white flex items-center gap-1 font-bold transition-colors"
                                    >
                                        <PlusCircle size={14} /> Add Cost
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {miscCosts.map((misc) => (
                                        <motion.div
                                            key={misc.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-3"
                                        >
                                            <input
                                                type="text"
                                                placeholder="Label (e.g. Transport)"
                                                className="flex-1 bg-white/5 border border-white/10 p-3 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
                                                value={misc.label}
                                                onChange={(e) => updateMiscCost(misc.id, 'label', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Amount"
                                                className="w-32 bg-white/5 border border-white/10 p-3 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
                                                value={misc.amount || ""}
                                                onChange={(e) => updateMiscCost(misc.id, 'amount', parseFloat(e.target.value) || 0)}
                                            />
                                            <button
                                                onClick={() => removeMiscCost(misc.id)}
                                                className="p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                    {miscCosts.length === 0 && (
                                        <p className="text-xs text-muted italic text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/10">No miscellaneous costs added.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={!formData.laborCost}
                            className="w-full mt-10 py-5 bg-gradient-to-r from-accent to-emerald-600 text-white font-bold text-lg rounded-2xl hover:shadow-xl hover:shadow-accent/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                        >
                            Analyze Economics & Estimate Profit <ArrowRight size={24} />
                        </button>
                    </motion.div>
                )}

                {step === 2 && result && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="flex items-center gap-4 mb-8">
                            <button onClick={() => setStep(1)} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                                <ArrowLeft />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Economic Projection</h2>
                                <p className="text-muted text-sm">Detailed breakdown of potential costs and returns for {formData.crop}.</p>
                            </div>
                        </div>

                        {/* Top Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 text-center">
                                <h3 className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Expected Yield</h3>
                                <p className="text-3xl font-bold text-white tracking-tighter">{result.yield} <span className="text-sm text-muted font-normal">Tons</span></p>
                            </div>
                            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 text-center">
                                <h3 className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Market Price</h3>
                                <p className="text-3xl font-bold text-white tracking-tighter">₹{marketPrices[formData.crop]} <span className="text-sm text-muted font-normal">/qt</span></p>
                            </div>
                            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 text-center">
                                <h3 className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Gross Revenue</h3>
                                <p className="text-3xl font-bold text-green-400 tracking-tighter">₹{Math.round(result.revenue).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Cost Breakdown</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: "Seeds", val: result.costBreakdown.seeds, color: "bg-blue-500" },
                                        { label: "Fertilizers", val: result.costBreakdown.fertilizers, color: "bg-purple-500" },
                                        { label: "Labour", val: result.costBreakdown.labor, color: "bg-accent" },
                                        { label: "Miscellaneous", val: result.costBreakdown.misc, color: "bg-orange-500" },
                                    ].map((item) => (
                                        <div key={item.label} className="flex flex-col gap-1">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-muted">{item.label}</span>
                                                <span className="text-white font-bold">₹{item.val.toLocaleString()}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(item.val / result.costBreakdown.total) * 100}%` }}
                                                    className={cn("h-full rounded-full", item.color)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-2 mt-2 border-t border-white/5 flex justify-between">
                                        <span className="text-sm font-bold text-white">Total Cost</span>
                                        <span className="text-sm font-bold text-red-400">₹{result.costBreakdown.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-accent/10 to-emerald-900/20 p-8 rounded-2xl border border-accent/20 flex flex-col items-center justify-center text-center backdrop-blur-md">
                                <h3 className="text-accent text-xs font-bold uppercase tracking-widest mb-2">Net Estimated Profit</h3>
                                <p className="text-5xl font-bold text-white tracking-tighter mb-4">₹{Math.round(result.profit).toLocaleString()}</p>
                                <div className="bg-black/30 px-6 py-2 rounded-full border border-white/10">
                                    <span className="text-xs text-muted uppercase font-bold mr-2">ROI:</span>
                                    <span className="text-lg font-black text-green-400">+{result.roi}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all active:scale-[0.98]"
                            >
                                Edit Selection
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-8 py-4 bg-accent/20 border border-accent/30 text-accent font-bold rounded-2xl hover:bg-accent/30 transition-all"
                            >
                                Save Report
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
