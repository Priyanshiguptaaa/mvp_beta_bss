import { Card } from "@/components/ui/card";

// Mock data
const hallucinationRate = [2.1, 1.8, 2.3, 2.0, 1.7, 2.5, 2.2]; // last 7 days
const driftTimeline = [0, 1, 0, 2, 1, 0, 3]; // drift events per day
const accuracySpread = [90, 92, 88, 91, 93, 89, 94]; // %

function BarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((v, i) => (
        <div
          key={i}
          className="rounded"
          style={{
            width: 12,
            height: `${(v / max) * 48 + 8}px`,
            background: color,
            transition: 'height 0.3s',
          }}
          title={v.toString()}
        />
      ))}
    </div>
  );
}

export default function ModelReliabilityCard() {
  return (
    <Card className="p-6 flex flex-col gap-4 bg-white shadow rounded-xl">
      <h2 className="text-lg font-bold mb-2">Model Reliability</h2>
      <div>
        <div className="text-xs text-gray-500 mb-1">Hallucination Rate (last 7 days, %)</div>
        <BarChart data={hallucinationRate} color="#6366f1" />
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-1 mt-2">Drift Detection Timeline (events)</div>
        <BarChart data={driftTimeline} color="#f59e42" />
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-1 mt-2">Accuracy Spread (%)</div>
        <BarChart data={accuracySpread} color="#10b981" />
      </div>
    </Card>
  );
} 