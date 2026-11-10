/**
 * AgroSense Farmer AI — Core Intelligence Engine
 * 
 * This module is the "brain" of AgroSense. All intelligence decisions
 * flow through here. The Chatbot, Calendar, and Risk Radar all consume
 * this module's output.
 * 
 * CURRENT STATE: Placeholder logic. 
 * NEXT STEP: Replace internals with a trained ML model or LLM API.
 */

export interface ActionPlan {
    day: string;
    action: string;
    type: 'irrigation' | 'fertilizer' | 'pest_control' | 'harvest' | 'observation';
    details: string;
    priority: 'high' | 'medium' | 'low';
}

export interface RiskAssessment {
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    factors: { name: string; severity: number; description: string }[];
    recommendation: string;
}

export interface AIResponse {
    text: string;
    confidence: number;
    sources: string[];
}

class FarmerAIEngine {
    /**
     * Generate a 7-day action plan for a specific farm/crop cycle.
     * In production, this will query the ML model with weather + soil + crop stage data.
     */
    async generatePlan(farmId: string): Promise<ActionPlan[]> {
        // PLACEHOLDER: Return a realistic template plan for wheat
        return [
            { day: 'Day 1', action: 'Soil Moisture Check', type: 'observation', details: 'Check moisture at 15cm depth in all blocks.', priority: 'high' },
            { day: 'Day 2', action: 'Irrigation', type: 'irrigation', details: 'Apply 3 acre-inches of water. CRI stage requires uniform coverage.', priority: 'high' },
            { day: 'Day 3', action: 'Rest Day', type: 'observation', details: 'Allow water absorption. No activity needed.', priority: 'low' },
            { day: 'Day 4', action: 'Weed Inspection', type: 'observation', details: 'Walk field borders for Phalaris minor presence.', priority: 'medium' },
            { day: 'Day 5', action: 'Urea Top Dress', type: 'fertilizer', details: 'Apply 30kg/acre Urea for tillering boost.', priority: 'high' },
            { day: 'Day 6', action: 'Pest Scan', type: 'pest_control', details: 'Check for aphid colonies on lower leaves.', priority: 'medium' },
            { day: 'Day 7', action: 'Weather Review', type: 'observation', details: 'Check 3-day forecast. Plan next irrigation if no rain expected.', priority: 'medium' },
        ];
    }

    /**
     * Answer a user query using farm context data.
     * In production, this will call an LLM with RAG over the user's farm data.
     */
    async answerQuery(userId: string, question: string): Promise<AIResponse> {
        const q = question.toLowerCase();

        if (q === 'hi' || q === 'hello' || q === 'namaste') {
            return {
                text: "Namaste! I'm your AgroSense farming assistant. I can help with irrigation schedules, fertilizer plans, pest identification, and market prices. What do you need help with?",
                confidence: 1.0,
                sources: ['system']
            };
        }

        if (q.includes('irrigation') || q.includes('water') || q.includes('paani')) {
            return {
                text: "For Wheat at the CRI (Crown Root Initiation) stage, apply **3 acre-inches** (~3 Lakh Liters per acre). Irrigate early morning (5-7 AM) to minimize evaporation. Your next irrigation should be around the tillering stage in about 20-25 days.",
                confidence: 0.85,
                sources: ['PAU Ludhiana Guidelines', 'Open-Meteo Weather Data']
            };
        }

        if (q.includes('fertilizer') || q.includes('urea') || q.includes('khad')) {
            return {
                text: "For Wheat at the current growth stage, apply **30 kg Urea per acre** as a top-dressing. Split your nitrogen: 1/3 at sowing (done), 1/3 at first irrigation (now), and 1/3 at second irrigation. Avoid applying Urea in standing water.",
                confidence: 0.82,
                sources: ['ICAR Recommendation', 'Soil Test Report']
            };
        }

        if (q.includes('weather') || q.includes('rain') || q.includes('mausam')) {
            return {
                text: "Based on the latest satellite data for your region: Clear skies for the next 3 days (Max: 28°C, Min: 12°C). No rain expected until next week. Wind speed is moderate at 8-12 km/h. Good conditions for spraying if needed.",
                confidence: 0.90,
                sources: ['Open-Meteo API', 'IMD Forecast']
            };
        }

        if (q.includes('price') || q.includes('rate') || q.includes('mandi') || q.includes('bhav')) {
            return {
                text: "Today's Mandi rates in your region:\n• Wheat (PBW-343): ₹2,125/quintal ↑2.5%\n• Basmati 1121: ₹3,450/quintal ↓1.2%\n• Mustard: ₹4,200/quintal ↓0.5%\n\nWheat prices are trending up due to low arrivals. Consider holding if storage is available.",
                confidence: 0.78,
                sources: ['AGMARKNET', 'Local Mandi Data']
            };
        }

        if (q.includes('pest') || q.includes('keeda') || q.includes('disease') || q.includes('rog')) {
            return {
                text: "Common threats for Wheat this season:\n1. **Aphids** — Check lower leaves. If 10+ per tiller, spray Imidacloprid 17.8 SL @ 100ml/acre.\n2. **Yellow Rust** — Watch for yellow stripe patterns. Apply Propiconazole 25 EC @ 200ml/acre if spotted.\n3. **Phalaris minor** — A major weed. Use Sulfosulfuron 75 WG if infestation is seen.",
                confidence: 0.80,
                sources: ['PAU Advisory', 'State Agriculture Dept']
            };
        }

        // Default fallback
        return {
            text: "I don't have specific data on that yet, but I'm learning! Try asking about:\n• Irrigation schedule\n• Fertilizer dose\n• Weather forecast\n• Mandi prices\n• Pest & disease management",
            confidence: 0.3,
            sources: ['system']
        };
    }

    /**
     * Evaluate risk for a specific crop cycle.
     * In production, this combines weather, pest, and market data.
     */
    async evaluateRisk(cropCycleId: string): Promise<RiskAssessment> {
        // PLACEHOLDER: Return a moderate-risk assessment
        return {
            riskLevel: 'moderate',
            factors: [
                { name: 'Weather', severity: 3, description: 'Dry spell expected. Irrigation needed within 48 hours.' },
                { name: 'Pest Pressure', severity: 5, description: 'Aphid population rising in nearby districts.' },
                { name: 'Market', severity: 2, description: 'Wheat prices stable with slight upward trend.' },
            ],
            recommendation: 'Schedule irrigation for tomorrow morning. Monitor for aphids during next field visit.'
        };
    }
}

// Singleton export — one AI engine for the whole app
export const farmerAI = new FarmerAIEngine();
