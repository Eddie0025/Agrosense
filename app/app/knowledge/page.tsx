import { BookOpen, Search, Leaf, ShieldAlert, Droplet, WifiOff } from "lucide-react";

const articles = [
    {
        id: 1,
        category: "Crop Management",
        title: "Rice: Best Practices for High Yield",
        icon: Leaf,
        readTime: "5 min read",
        color: "text-green-400"
    },
    {
        id: 2,
        category: "Pest Control",
        title: "Integrated Pest Management (IPM) for Wheat",
        icon: ShieldAlert,
        readTime: "8 min read",
        color: "text-red-400"
    },
    {
        id: 3,
        category: "Water",
        title: "Drip Irrigation Maintenance Guide",
        icon: Droplet,
        readTime: "4 min read",
        color: "text-blue-400"
    },
    {
        id: 4,
        category: "Soil Health",
        title: "Organic Carbon Improvement Techniques",
        icon: BookOpen,
        readTime: "6 min read",
        color: "text-yellow-400"
    },
];

export default function KnowledgePage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Knowledge Hub</h1>
                    <p className="text-muted">Expert guides, best practices, and farming manuals.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search guides (e.g., 'Wheat Rust')"
                        className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-accent/50 focus:bg-black/40 transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                    <div key={article.id} className="glass-card rounded-2xl p-6 relative group cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/5 transition-all">
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                                <article.icon className={`${article.color} h-8 w-8`} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted bg-white/5 px-3 py-1 rounded-full border border-white/5">{article.category}</span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-accent transition-colors leading-tight">{article.title}</h3>
                        <p className="text-sm text-gray-400 mb-6">Learn essential techniques to improve your farm's productivity and sustainability.</p>

                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-xs text-muted font-medium">{article.readTime}</span>
                            <span className="text-xs font-bold text-accent group-hover:translate-x-1 transition-transform">Read Guide &rarr;</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center justify-between bg-gradient-to-r from-accent/10 to-transparent">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-accent/20 rounded-full text-accent font-bold shadow-lg shadow-accent/10">
                        <WifiOff size={24} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-lg">Available Offline</h4>
                        <p className="text-sm text-gray-300 mt-1">These guides are automatically saved for when you don't have internet.</p>
                    </div>
                </div>
                <button className="hidden md:block px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">
                    Manage Downloads
                </button>
            </div>
        </div>
    );
}
