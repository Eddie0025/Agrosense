"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Mic, Sparkles } from "lucide-react";
import { farmerAI } from "@/lib/farmerAI";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    time: string;
}

export default function AdvisorPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Namaste! I am AgroSense AI. Ask me about your crops, weather, or soil health.", sender: 'ai', time: '10:00 AM' }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !user) return;

        const userMsg: Message = {
            id: messages.length + 1,
            text: input,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Use Farmer AI Engine for responses
            const response = await farmerAI.answerQuery(user.id, input);

            // Log to Supabase
            const { error: logError } = await supabase
                .from('ai_logs')
                .insert({
                    user_id: user.id,
                    query_text: input,
                    response_text: response.text,
                    source: 'chatbot'
                });

            if (logError) console.error('Error logging AI query:', logError);

            const aiMsg: Message = {
                id: messages.length + 2,
                text: response.text,
                sender: 'ai',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Advisor error:', error);
            const errorMsg: Message = {
                id: messages.length + 2,
                text: "I'm having trouble connecting right now. Please try again later.",
                sender: 'ai',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/20 rounded-xl">
                    <Sparkles className="text-accent" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">AI Advisor</h1>
                    <p className="text-muted text-sm">Your personal agriculture expert, available 24/7.</p>
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-3xl flex flex-col overflow-hidden border border-white/10 shadow-2xl relative">
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-2xl p-5 shadow-lg ${msg.sender === 'user'
                                ? 'bg-gradient-to-br from-accent to-emerald-600 text-white rounded-br-none'
                                : 'bg-white/10 border border-white/5 text-gray-100 rounded-bl-none backdrop-blur-md'
                                }`}>
                                <div className="flex items-center gap-2 mb-2 opacity-80">
                                    {msg.sender === 'ai' ? <Bot size={14} /> : <User size={14} />}
                                    <span className="text-[10px] font-medium uppercase tracking-wider">{msg.sender === 'ai' ? 'AgroSense' : (user?.user_metadata?.full_name || 'You')} • {msg.time}</span>
                                </div>
                                <p className="leading-relaxed">{msg.text}</p>
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 rounded-bl-none flex gap-1.5 items-center">
                                <span className="text-xs text-muted mr-2">AgroSense is thinking</span>
                                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-xl">
                    <div className="flex gap-3">
                        <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-muted hover:text-white hover:bg-white/10 transition-colors">
                            <Mic size={22} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask anything about farming..."
                            className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-6 text-white text-lg placeholder:text-gray-500 focus:outline-none focus:border-accent/50 focus:bg-black/40 transition-all shadow-inner"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="p-4 bg-accent text-accent-foreground rounded-2xl font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-accent/20 hover:scale-105 transition-all"
                        >
                            <Send size={22} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
