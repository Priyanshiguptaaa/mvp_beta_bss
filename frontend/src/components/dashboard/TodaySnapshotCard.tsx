import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const snapshot = {
  incidents: 12,
  failedTests: 9,
  autoFixed: 5,
  pendingFixes: 7,
  hallucinations: 6,
  autoFixedIncidents: 3,
  topCategories: ["Sales Chatbot", "Lead Scoring Drift"],
  recommendations: ["Schedule prompt consistency test for Lead Prioritization Agent"],
  filters: ["All", "Sales Agent", "Data Enrichment Agent"],
};

const metrics = [
  { label: "Incidents", value: snapshot.incidents, color: "text-blue-600" },
  { label: "Failed Tests", value: snapshot.failedTests, color: "text-red-500" },
  { label: "Auto-fixed", value: snapshot.autoFixed, color: "text-green-600" },
  { label: "Pending Fixes", value: snapshot.pendingFixes, color: "text-yellow-500" },
  { label: "Hallucinations", value: snapshot.hallucinations, color: "text-pink-600" },
  { label: "Auto-fixed Incidents", value: snapshot.autoFixedIncidents, color: "text-green-600" },
];

export default function TodaySnapshotCard() {
  return (
    <div className="flex flex-col gap-4">
      {/* Metrics Row */}
      <div className="flex flex-wrap gap-4 w-full">
        {metrics.map((m) => (
          <Card key={m.label} className="flex-1 min-w-[140px] p-4 flex flex-col items-center justify-center bg-white shadow rounded-xl">
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-xs text-gray-500 mt-1 text-center">{m.label}</div>
          </Card>
        ))}
      </div>
      {/* Filters */}
      <Card className="p-4 bg-white shadow rounded-xl flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 mr-2">Quick Filters:</span>
        {snapshot.filters.map((f) => (
          <Button key={f} size="sm" variant="outline" className="text-xs px-2 py-1">
            {f}
          </Button>
        ))}
      </Card>
      {/* Top Categories */}
      <Card className="p-4 bg-white shadow rounded-xl">
        <div className="text-xs text-gray-500 mb-1">Top Incident Categories</div>
        <div className="flex flex-wrap gap-2">
          {snapshot.topCategories.map((cat) => (
            <Badge key={cat} variant="secondary">{cat}</Badge>
          ))}
        </div>
      </Card>
      {/* Recommendations */}
      <Card className="p-4 bg-white shadow rounded-xl">
        <div className="text-xs text-gray-500 mb-1">Recommendations</div>
        <ul className="list-disc list-inside text-xs text-gray-700">
          {snapshot.recommendations.map((rec) => (
            <li key={rec}>{rec}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
} 