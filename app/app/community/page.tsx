"use client";

import { useState, useEffect } from "react";
import { Users, Heart, MessageSquare, Share2, Tag, Image as ImageIcon, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Post {
    id: string;
    author_id: string;
    content: string;
    tag: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    profiles: {
        full_name: string;
    } | null;
}

const FALLBACK_POSTS = [
    {
        id: "fp-1",
        author_id: "system",
        content: "⚠️ ALERT: Increased Whitefly activity detected in the northern sector. We recommend switching to Neem-based sprays if humidity stays above 75%. #PestControl #AgroSenseInsights",
        tag: "Pest Alert",
        likes_count: 24,
        comments_count: 5,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        profiles: { full_name: "AgroSense Insights" }
    },
    {
        id: "fp-2",
        author_id: "system",
        content: "Market Update: Organic Basmati prices are expected to rise by 12% next month due to supply chain shifts. Consider holding your harvest if storage is optimal. 📈 #MarketTrends",
        tag: "Market",
        likes_count: 42,
        comments_count: 12,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        profiles: { full_name: "Market Bot" }
    },
    {
        id: "fp-3",
        author_id: "system",
        content: "Just finished the soil analysis for the South-West block. Phosphorus levels are peak—ready for the next planting cycle! 🌾 #FarmerLife",
        tag: "Achievement",
        likes_count: 18,
        comments_count: 3,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        profiles: { full_name: "Farmer Rajesh" }
    }
];

export default function CommunityPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>(FALLBACK_POSTS);
    const [isLoading, setIsLoading] = useState(true);
    const [newPost, setNewPost] = useState("");
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchPosts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles(full_name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
            // On error, we keep the fallback posts and show a subtle hint
            setIsLoading(false);
        } else if (data && data.length > 0) {
            setPosts(data as any[]);
            setFetchError(null);
            setIsLoading(false);
        } else {
            // If DB is empty, keep fallback
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePost = async () => {
        if (!newPost.trim() || !user) return;

        const { error } = await supabase
            .from('posts')
            .insert({
                author_id: user.id,
                content: newPost,
                tag: "General"
            });

        if (error) {
            console.error('Error creating post:', error);
            alert("Failed to create post. Please try again.");
        } else {
            setNewPost("");
            fetchPosts();
        }
    };

    const handleDelete = async (id: string, authorId: string) => {
        if (user?.id !== authorId) return;

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting post:', error);
            alert("Failed to delete post.");
        } else {
            fetchPosts();
        }
    };


    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours === 1) return "1h ago";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Community Feed</h1>
                    <p className="text-muted">Connect with other farmers, share tips, and grow together.</p>
                </div>
            </div>

            {/* Create Post */}
            {user && (
                <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                    <div className="flex gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                            {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                            <textarea
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent/50 resize-none min-h-[120px] placeholder:text-gray-500 transition-colors"
                                placeholder="What's happening on your farm?"
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                            />
                            <div className="flex justify-between items-center mt-3">
                                <div className="flex gap-2 text-muted">
                                    <button className="hover:text-accent p-2 hover:bg-white/5 rounded-full transition-colors"><ImageIcon size={20} /></button>
                                    <button className="hover:text-accent p-2 hover:bg-white/5 rounded-full transition-colors"><Tag size={20} /></button>
                                </div>
                                <button
                                    onClick={handlePost}
                                    disabled={!newPost.trim()}
                                    className="bg-accent text-accent-foreground px-6 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-accent/20 transition-all"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Feed */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {posts.length > 0 ? posts.map((post, idx) => (
                        <motion.div
                            key={post.id || `temp-post-${idx}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card p-6 rounded-2xl relative group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md bg-white/10 text-white">
                                        {post.profiles?.full_name?.[0] || "?"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                            {post.profiles?.full_name || "Anonymous Farmer"}
                                        </h3>
                                        <p className="text-xs text-muted mt-0.5">{formatTime(post.created_at)} • <span className="text-accent/80">{post.tag}</span></p>
                                    </div>
                                </div>

                                {user?.id === post.author_id && (
                                    <button
                                        onClick={() => handleDelete(post.id, post.author_id)}
                                        className="p-2 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>

                            <p className="text-gray-200 text-sm mb-6 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                            <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                                <button className="flex items-center gap-2 text-muted text-sm hover:text-red-400 transition-colors group">
                                    <Heart size={18} className="group-hover:fill-red-400 transition-colors" /> {post.likes_count}
                                </button>
                                <button className="flex items-center gap-2 text-muted text-sm hover:text-blue-400 transition-colors">
                                    <MessageSquare size={18} /> {post.comments_count}
                                </button>
                                <button className="flex items-center gap-2 text-muted text-sm hover:text-green-400 transition-colors ml-auto">
                                    <Share2 size={18} /> Share
                                </button>
                            </div>
                        </motion.div>
                    )) : null}

                    {isLoading && posts.length === 0 ? (
                        <div key="loading-feed" className="text-center py-20 text-muted animate-pulse">
                            Synchronizing secure feed...
                        </div>
                    ) : null}

                    {!isLoading && posts.length === 0 ? (
                        <div key="empty-feed" className="text-center py-20 px-8 glass-panel rounded-2xl border border-white/5">
                            <Users className="mx-auto text-muted mb-4 opacity-20" size={48} />
                            <h3 className="text-white font-bold mb-1">Feed Initializing</h3>
                            <p className="text-muted text-sm max-w-xs mx-auto">
                                The AgroSense Global Network is coming online.
                            </p>
                        </div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}
