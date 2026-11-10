import { Landmark, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const schemes = [
    {
        id: 1,
        name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        description: "Crop insurance scheme to provide financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
        benefits: ["Insurance cover against non-preventable natural risks", "Stabilize income"],
        eligible: "All farmers growing notified crops",
        link: "https://pmfby.gov.in/"
    },
    {
        id: 2,
        name: "Soil Health Card Scheme",
        description: "Government issues soil health cards to farmers which will carry crop-wise recommendations of nutrients and fertilizers.",
        benefits: ["Soil testing every 2 years", "Fertilizer recommendations"],
        eligible: "All land-holding farmers",
        link: "https://soilhealth.dac.gov.in/"
    },
    {
        id: 3,
        name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
        description: "Focuses on creating sources for assured irrigation, also known as 'Har Khet Ko Pani'.",
        benefits: ["Subsidies for drip/sprinkler irrigation", "Water conservation support"],
        eligible: "Farmers with cultivable land",
        link: "https://pmksy.gov.in/"
    },
    {
        id: 4,
        name: "Kisan Credit Card (KCC)",
        description: "Provides adequate and timely credit support from the banking system.",
        benefits: ["Flexible loan repayment", "ATM enabled credit card"],
        eligible: "Individual/Joint borrowers who are owner cultivators",
        link: "https://pib.gov.in/"
    }
];

export default function SchemesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Government Schemes</h1>
                <p className="text-muted">Explore benefits, subsidies, and insurance schemes applicable to you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schemes.map((scheme) => (
                    <div key={scheme.id} className="glass-card rounded-2xl p-8 flex flex-col relative overflow-hidden group">
                        {/* Hover Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors pointer-events-none" />

                        <div className="flex items-start gap-5 mb-6 relative z-10">
                            <div className="glass-panel p-4 rounded-2xl border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                                <Landmark className="text-accent h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">{scheme.name}</h2>
                                <p className="text-sm text-muted mt-2 leading-relaxed">{scheme.description}</p>
                            </div>
                        </div>

                        <div className="mb-8 flex-1 relative z-10 bg-black/20 rounded-xl p-4 border border-white/5">
                            <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                                <CheckCircle size={14} className="text-accent" /> Key Benefits
                            </h4>
                            <ul className="space-y-2">
                                {scheme.benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 shrink-0" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto relative z-10">
                            <span className="text-xs text-muted font-medium bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                Eligibility: <span className="text-white">{scheme.eligible}</span>
                            </span>
                            <a
                                href={scheme.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-accent hover:text-white font-bold transition-colors group/link"
                            >
                                Visit Portal <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
