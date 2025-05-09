import { Card } from "@/components/ui/card";
import { AlertTriangle, Flame, TrendingDown } from "lucide-react";

const suggestions = [
  {
    icon: <TrendingDown className="w-4 h-4 text-orange-500" />, 
    text: "This domain is drifting",
    color: "text-orange-600"
  },
  {
    icon: <Flame className="w-4 h-4 text-red-500" />, 
    text: "Fallbacks triggered 10+ times today",
    color: "text-red-600"
  },
  {
    icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />, 
    text: "Model X failed 3 times on Y-type queries",
    color: "text-yellow-700"
  },
];

export default function SuggestionsCard() {
  return (
    <Card className="p-6 flex flex-col gap-4 bg-white shadow rounded-xl">
      <h2 className="text-lg font-bold mb-2">Suggestions & At-Risk Warnings</h2>
      <div className="flex flex-col gap-3">
        {suggestions.map((s, i) => (
          <div key={i} className={`flex items-center gap-2 bg-gray-50 rounded p-2 ${s.color}`}>
            {s.icon}
            <span className="text-xs font-medium">{s.text}</span>
          </div>
        ))}
      </div>
    </Card>
  );
} 