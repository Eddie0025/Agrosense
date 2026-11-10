import { EstimatorWizard } from "@/components/tools/EstimatorWizard";

export default function CostPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Economics Section</h1>
                <p className="text-muted">Analyze your farm's financial health, input costs, and projected profits.</p>
            </div>

            <EstimatorWizard />
        </div>
    );
}
