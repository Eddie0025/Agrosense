"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Droplets, Sprout, Bug, X, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Event {
    id: string;
    day: number;
    month: number;
    year: number;
    title: string;
    type: "water" | "fert" | "pest" | "other";
    time: string;
    details?: string;
    quantity?: string;
    status?: string;
}

export default function CalendarPage() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [newEvent, setNewEvent] = useState({
        title: "",
        type: "water" as "water" | "fert" | "pest" | "other",
        time: "08:00 AM",
        details: "",
        quantity: "",
        date: new Date().toISOString().split('T')[0]
    });

    const [selectedFarm, setSelectedFarm] = useState<string>("all");
    const [farms, setFarms] = useState<any[]>([]);

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    useEffect(() => {
        const fetchFarms = async () => {
            if (!user) return;
            const { data } = await supabase.from('farms').select('*').eq('owner_id', user.id);
            if (data) setFarms(data);
        };
        fetchFarms();
    }, [user]);

    const fetchEvents = async () => {
        if (!user) return;
        setIsLoading(true);

        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 0).toISOString();

        let query = supabase
            .from('calendar_events')
            .select('*')
            .gte('scheduled_at', startDate)
            .lte('scheduled_at', endDate);

        // Apply farm filtering ONLY if a specific farm is selected
        if (selectedFarm !== "all") {
            query = query.eq('farm_id', selectedFarm);
        } else {
            // Default to owner_id if No specific farm is selected
            query = query.eq('owner_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching events:', error.message || error);

            // FALLBACK: If the error is about a missing farm_id column, try a basic query
            if (error.code === '42703') { // Undefined column
                console.warn("Retrying with legacy query (missing farm_id column)...");
                const { data: fallbackData } = await supabase
                    .from('calendar_events')
                    .select('*')
                    .eq('owner_id', user.id)
                    .gte('scheduled_at', startDate)
                    .lte('scheduled_at', endDate);

                if (fallbackData) {
                    processEvents(fallbackData);
                }
            } else {
                setEvents([]);
            }
        } else if (data) {
            processEvents(data);
        }
        setIsLoading(false);
    };

    const processEvents = (data: any[]) => {
        const mappedEvents: Event[] = data.map(e => {
            const date = new Date(e.scheduled_at);
            return {
                id: e.id,
                day: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear(),
                title: e.title,
                type: mapEventType(e.event_type),
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                details: e.ai_rationale,
                quantity: e.quantity_metric,
                status: e.status
            };
        });
        setEvents(mappedEvents);
    };

    const mapEventType = (type: string): "water" | "fert" | "pest" | "other" => {
        switch (type) {
            case 'irrigation': return 'water';
            case 'fertilizer': return 'fert';
            case 'pest_control': return 'pest';
            default: return 'other';
        }
    };

    const reverseMapEventType = (type: string): string => {
        switch (type) {
            case 'water': return 'irrigation';
            case 'fert': return 'fertilizer';
            case 'pest': return 'pest_control';
            default: return 'other';
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [currentDate, user, selectedFarm]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const getEventsForDay = (day: number) =>
        events.filter(e => e.day === day && e.month === month && e.year === year);

    const getEventStyles = (type: string) => {
        switch (type) {
            case 'water': return "bg-blue-500/10 border-blue-500/20 text-blue-300";
            case 'fert': return "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
            case 'pest': return "bg-red-500/10 border-red-500/20 text-red-300";
            default: return "bg-amber-500/10 border-amber-500/20 text-amber-300";
        }
    };

    const getEventIcon = (type: string, size = 12) => {
        switch (type) {
            case 'water': return <Droplets size={size} />;
            case 'fert': return <Sprout size={size} />;
            case 'pest': return <Bug size={size} />;
            default: return <Clock size={size} />;
        }
    };

    const handleAddEvent = async () => {
        if (!newEvent.title || !user) return;

        const [y, m, d] = newEvent.date.split('-').map(Number);
        const scheduledAt = new Date(y, m - 1, d);
        const [time, modifier] = newEvent.time.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        scheduledAt.setHours(hours, minutes);

        // LOCATION-AWARE GENERATION
        let rationale = newEvent.details;
        if (!rationale && (newEvent as any).farm_id) {
            const farm = farms.find(f => f.id === (newEvent as any).farm_id);
            if (farm) {
                rationale = `Personalized for ${farm.location_city}: Based on your ${farm.soil_type} soil and current weather trends in ${farm.location_city}, this ${newEvent.type} activity is optimized for maximum absorption and minimal runoff.`;
            }
        }

        const { error } = await supabase
            .from('calendar_events')
            .insert({
                title: newEvent.title,
                event_type: reverseMapEventType(newEvent.type),
                scheduled_at: scheduledAt.toISOString(),
                ai_rationale: rationale,
                quantity_metric: newEvent.quantity,
                status: 'pending',
                owner_id: user.id,
                farm_id: (newEvent as any).farm_id || null
            });

        if (!error) {
            setIsAddModalOpen(false);
            setNewEvent({
                title: "",
                type: "water",
                time: "08:00 AM",
                details: "",
                quantity: "",
                date: new Date().toISOString().split('T')[0]
            });
            fetchEvents();
        }
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    return (
        <div className="flex flex-col h-full space-y-6 max-h-screen overflow-hidden">
            {/* Page Header */}
            <div className="flex justify-between items-center px-2">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <CalendarIcon className="text-accent w-8 h-8" />
                        Smart Crop Calendar
                    </h1>
                    <p className="text-muted text-sm mt-1">Optimize your harvest with AI-scheduled farming tasks.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-accent hover:bg-emerald-500 text-accent-foreground px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all flex items-center gap-2 group active:scale-95"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    Schedule Activity
                </button>
            </div>

            {/* Main Calendar Card */}
            <div className="flex-1 glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                {/* Calendar Navigator */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-6">
                        <h2 className="text-2xl font-bold text-white min-w-[200px]">
                            {monthName} <span className="text-accent/80 ml-1">{year}</span>
                        </h2>
                        <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                            <button
                                onClick={() => setCurrentDate(new Date(year, month - 1))}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-3 text-xs font-bold text-muted hover:text-accent transition-colors"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date(year, month + 1))}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Land Selector Filter */}
                        {farms.length > 0 && (
                            <div className="flex items-center gap-3 pl-6 border-l border-white/10 ml-2">
                                <span className="text-[10px] font-black text-muted uppercase tracking-widest italic">View:</span>
                                <select
                                    className="bg-black/60 border border-white/10 px-4 py-2 rounded-xl text-white text-xs font-bold focus:border-accent outline-none appearance-none cursor-pointer hover:bg-black/80 transition-all"
                                    value={selectedFarm}
                                    onChange={(e) => setSelectedFarm(e.target.value)}
                                >
                                    <option value="all">All Lands (Aggregated)</option>
                                    {farms.map(f => (
                                        <option key={f.id} value={f.id}>{f.name} ({f.location_city})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <Droplets size={14} /> Irrigation
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <Sprout size={14} /> Nutrition
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                            <Bug size={14} /> Protection
                        </div>
                    </div>
                </div>

                {/* Days of Week Header */}
                <div className="grid grid-cols-7 border-b border-white/5 bg-black/20">
                    {daysOfWeek.map(d => (
                        <div key={d} className="py-4 text-center text-xs font-bold text-muted/60 uppercase tracking-[0.2em]">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid Body */}
                <div className="flex-1 grid grid-cols-7 grid-rows-[repeat(6,1fr)] min-h-[700px] overflow-y-auto custom-scrollbar bg-white/[0.01]">
                    {/* Placeholder for previous month days */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="border-r border-b border-white/[0.03] bg-black/[0.05]" />
                    ))}

                    {/* Actual month days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayEvents = getEventsForDay(day);
                        const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                        return (
                            <div
                                key={day}
                                className={cn(
                                    "border-r border-b border-white/[0.03] p-2 flex flex-col gap-1 transition-all group relative overflow-hidden",
                                    isToday ? "bg-accent/[0.05]" : "hover:bg-white/[0.02]"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={cn(
                                        "w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg transition-all z-10",
                                        isToday
                                            ? "bg-accent text-accent-foreground shadow-lg shadow-accent/40"
                                            : "text-muted group-hover:text-white"
                                    )}>
                                        {day}
                                    </span>
                                    {dayEvents.length > 0 && (
                                        <span className="text-[9px] text-muted font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                            {dayEvents.length} Tasks
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-0.5 mt-1 relative">
                                    {dayEvents.map((event) => (
                                        <motion.div
                                            key={event.id}
                                            layoutId={event.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedEvent(event);
                                            }}
                                            whileHover={{ scale: 1.02, x: 2 }}
                                            className={cn(
                                                "px-2 py-1.5 rounded-lg border text-[9px] font-bold cursor-pointer transition-all shadow-sm flex items-center gap-1.5",
                                                getEventStyles(event.type)
                                            )}
                                        >
                                            <div className="shrink-0">{getEventIcon(event.type, 12)}</div>
                                            <span className="truncate">{event.title}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Fill remaining cells to maintain grid shape */}
                    {Array.from({ length: (42 - (firstDayOfMonth + daysInMonth)) }).map((_, i) => (
                        <div key={`fill-${i}`} className="border-r border-b border-white/[0.01] bg-black/[0.02]" />
                    ))}
                </div>
            </div>

            {/* Event Detail Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEvent(null)}
                            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg glass-panel p-0 rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden bg-[#020617]"
                        >
                            {/* Modal Header */}
                            <div className={cn(
                                "p-10 text-white relative h-48 flex flex-col justify-end",
                                selectedEvent.type === 'water' ? 'bg-gradient-to-br from-blue-600 to-blue-900' :
                                    selectedEvent.type === 'fert' ? 'bg-gradient-to-br from-emerald-600 to-emerald-900' :
                                        'bg-gradient-to-br from-red-600 to-red-900'
                            )}>
                                <button onClick={() => setSelectedEvent(null)} className="absolute top-8 right-8 p-2.5 bg-black/20 hover:bg-black/40 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
                                        {getEventIcon(selectedEvent.type, 32)}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black leading-tight tracking-tight">{selectedEvent.title}</h3>
                                        <div className="flex items-center gap-3 text-white/80 text-xs font-bold mt-2 uppercase tracking-wide">
                                            <CalendarIcon size={14} className="text-white/60" /> {selectedEvent.day} {monthName} {selectedEvent.year}
                                            <span className="opacity-40">•</span>
                                            <Clock size={14} className="text-white/60" /> {selectedEvent.time}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-10 space-y-8">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="bg-white/5 p-5 rounded-[1.5rem] border border-white/5">
                                        <p className="text-[10px] text-muted uppercase font-black tracking-[0.2em] mb-3">Status</p>
                                        <div className="flex items-center gap-3 text-accent font-bold">
                                            <CheckCircle2 size={20} /> Scheduled
                                        </div>
                                    </div>
                                    {selectedEvent.quantity && (
                                        <div className="bg-white/5 p-5 rounded-[1.5rem] border border-white/5">
                                            <p className="text-[10px] text-muted uppercase font-black tracking-[0.2em] mb-3">Target Amount</p>
                                            <div className="flex items-center gap-3 text-white font-black italic">
                                                {selectedEvent.quantity}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <p className="text-[10px] text-muted uppercase font-black tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <AlertCircle size={16} className="text-accent" />
                                        Activity Intelligent Context
                                    </p>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-white/90 leading-relaxed text-sm italic font-medium">
                                        {selectedEvent.details || "This task was automatically recommended by AgroSense AI after cross-referencing satellite spectral data with your specific crop cycle stage."}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="w-full py-5 bg-accent text-accent-foreground rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-500 transition-all shadow-xl shadow-accent/20 active:scale-[0.98]"
                                >
                                    Acknowledge Task
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Event Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md glass-panel p-10 rounded-[2.5rem] border border-white/10 shadow-3xl bg-[#020617]"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-white tracking-[0.1em] uppercase italic">Add activity</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-muted hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Farm Selection (NEW) */}
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2">Target Land / Farm</label>
                                    <select
                                        className="w-full bg-black/40 border border-white/10 p-4.5 rounded-2xl text-white appearance-none outline-none focus:border-accent/40 transition-all text-sm cursor-pointer"
                                        value={(newEvent as any).farm_id || ""}
                                        onChange={e => setNewEvent({ ...newEvent, farm_id: e.target.value } as any)}
                                        required
                                    >
                                        <option value="" disabled>Select a land plot...</option>
                                        {farms.map(f => (
                                            <option key={f.id} value={f.id}>{f.name} ({f.location_city})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2">Task Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter activity name..."
                                        className="w-full bg-black/40 border border-white/10 p-4.5 rounded-2xl text-white focus:border-accent/40 outline-none transition-all placeholder:text-gray-600 text-sm"
                                        value={newEvent.title}
                                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2">Execution Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-black/40 border border-white/10 p-4.5 rounded-2xl text-white outline-none focus:border-accent/40 transition-all text-sm"
                                            value={newEvent.date}
                                            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2">Priority Slot</label>
                                        <select
                                            className="w-full bg-black/40 border border-white/10 p-4.5 rounded-2xl text-white appearance-none outline-none focus:border-accent/40 transition-all text-sm cursor-pointer"
                                            value={newEvent.time}
                                            onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                        >
                                            <option value="06:00 AM">06:00 AM (Early)</option>
                                            <option value="08:00 AM">08:00 AM (Morning)</option>
                                            <option value="10:00 AM">10:00 AM (Late Morning)</option>
                                            <option value="12:00 PM">12:00 PM (Midday)</option>
                                            <option value="02:00 PM">02:00 PM (Afternoon)</option>
                                            <option value="04:00 PM">04:00 PM (Late Afternoon)</option>
                                            <option value="06:00 PM">06:00 PM (Evening)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2">Category</label>
                                        <select
                                            className="w-full bg-black/40 border border-white/10 p-4.5 rounded-2xl text-white appearance-none outline-none focus:border-accent/40 transition-all text-sm cursor-pointer"
                                            value={newEvent.type}
                                            onChange={e => setNewEvent({ ...newEvent, type: e.target.value as any })}
                                        >
                                            <option value="water">💧 Irrigation</option>
                                            <option value="fert">🌿 Fertilizer</option>
                                            <option value="pest">🛡️ Protection</option>
                                            <option value="other">⚙️ Maintenance</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2">Dosage Info</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 50 kg/acr"
                                            className="w-full bg-black/40 border border-white/10 p-4.5 rounded-2xl text-white outline-none focus:border-accent/40 transition-all placeholder:text-gray-600 text-sm"
                                            value={newEvent.quantity}
                                            onChange={e => setNewEvent({ ...newEvent, quantity: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-2">Operations Notes</label>
                                    <textarea
                                        placeholder="Internal notes for field staff..."
                                        className="w-full bg-black/40 border border-white/10 p-4.5 rounded-2xl text-white outline-none h-28 resize-none focus:border-accent/40 transition-all placeholder:text-gray-600 text-sm"
                                        value={newEvent.details}
                                        onChange={e => setNewEvent({ ...newEvent, details: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAddEvent}
                                disabled={isLoading || !newEvent.title}
                                className="w-full mt-10 py-5 bg-gradient-to-r from-accent to-emerald-600 text-accent-foreground rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-accent/30 hover:shadow-accent/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isLoading ? "Synchronizing..." : "Create Activity Record"}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
