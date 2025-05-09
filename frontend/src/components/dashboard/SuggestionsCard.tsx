import { Card } from "@/components/ui/card";
import { AlertTriangle, Flame, TrendingDown, Bot } from "lucide-react";

const suggestions = [
  {
    icon: "drift",
    text: "Lead scoring inputs show significant data drift this week",
    color: "warning"
  },
  {
    icon: "api",
    text: "CRM Enrichment API was down for 13 minutes today",
    color: "error"
  },
  {
    icon: "hallucination",
    text: "Auto-fixed hallucination in Sales Chatbot — consider tightening prompt instructions",
    color: "info"
  }
];

function getIcon(type: string) {
  if (type === "drift") return <TrendingDown className="w-4 h-4 text-orange-500" />;
  if (type === "api") return <Flame className="w-4 h-4 text-red-500" />;
  if (type === "hallucination") return <Bot className="w-4 h-4 text-blue-500" />;
  return <AlertTriangle className="w-4 h-4 text-gray-400" />;
}

function getColor(type: string) {
  if (type === "warning") return "text-orange-600";
  if (type === "error") return "text-red-600";
  if (type === "info") return "text-blue-600";
  return "text-gray-600";
}

export default function SuggestionsCard() {
  return (
    <Card className="p-6 flex flex-col gap-4 bg-white shadow rounded-xl">
      <h2 className="text-lg font-bold mb-2">Suggestions & At-Risk Warnings</h2>
      <div className="flex flex-col gap-3">
        {suggestions.map((s, i) => (
          <div key={i} className={`flex items-center gap-2 bg-gray-50 rounded p-2 ${getColor(s.color)}`}>
            {getIcon(s.icon)}
            <span className="text-xs font-medium">{s.text}</span>
          </div>
        ))}
      </div>
    </Card>
  );
} 