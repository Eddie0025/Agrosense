"use client";

import { useState } from "react";
import { User, MapPin, Sprout, Save, Phone, Layout, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { LandPortfolio } from "@/components/dashboard/LandPortfolio";

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "Aditya Farmer",
        phone: "+91 98765 43210",
        state: "Punjab",
        district: "Ludhiana",
        landSize: "12",
        soilType: "Alluvial",
        irrigation: "Drip + Canal"
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call (Optimized for demo speed)
        setTimeout(() => {
            setIsLoading(false);
            alert("✅ Profile details updated successfully!");
        }, 400);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Farm Profile</h1>
                <p className="text-muted">Manage your personal details and farm configuration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Col: Personal Info & Form Start */}
                <div className="md:col-span-1 space-y-6">
                    <form id="profile-details-form" onSubmit={handleSave} className="space-y-6">
                        <div className="glass-panel p-6 rounded-2xl text-center border border-white/10">
                            <div className="relative w-24 h-24 mx-auto mb-4 group">
                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10 shadow-xl shadow-accent/20">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-accent to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
                                            {formData.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                                    <Camera className="text-white w-8 h-8" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                            <h2 className="text-xl font-bold text-white">{formData.name}</h2>
                            <p className="text-sm text-muted">Owner</p>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <User size={16} className="text-accent" /> Personal Details
                            </h3>

                            <div className="space-y-1">
                                <label className="text-xs text-muted">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-accent/50 text-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-muted">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-2 top-1/2 -translate-y-1/2 text-muted h-3 w-3" />
                                    <input
                                        type="text"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-7 pr-2 text-white focus:outline-none focus:border-accent/50 text-sm"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="submit"
                                form="profile-details-form"
                                disabled={isLoading}
                                className="w-full py-4 bg-accent text-accent-foreground rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? <span className="animate-spin text-xl">⟳</span> : <Save size={18} />}
                                Update Profile
                            </button>
                            <p className="text-[10px] text-muted text-center uppercase font-black tracking-widest opacity-50">Saves Personal Info Only</p>
                        </div>
                    </form>
                </div>

                {/* Right Col: Land Portfolio (Decoupled from Profile Form) */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-xl relative bg-[#0a0f1e]/40">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-blue-500 to-transparent opacity-50" />
                        <LandPortfolio />
                    </div>
                </div>
            </div>
        </div>
    );
}
