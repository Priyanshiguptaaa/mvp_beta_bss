import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const snapshot = {
  incidents: 7,
  failedTests: 3,
  autoFixed: 4,
  pendingFixes: 2,
  hallucinations: 2,
  autoFixedIncidents: 3,
  topCategories: ["Finance Agent", "Data Drift", "API Timeout"],
  recommendations: ["Schedule regression test", "Review Finance Agent failures"],
};

const filters = ["All", "Finance Agent", "Data Drift", "API Timeout"];

export default function TodaySnapshotCard() {
  return (
    <Card className="p-6 flex flex-col gap-4 bg-white shadow rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">Today's Snapshot</h2>
        <Badge variant="outline">Live</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <div className="text-2xl font-bold text-blue-600">{snapshot.incidents}</div>
          <div className="text-xs text-gray-500">Incidents</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-500">{snapshot.failedTests}</div>
          <div className="text-xs text-gray-500">Failed Tests</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{snapshot.autoFixed}</div>
          <div className="text-xs text-gray-500">Auto-fixed</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-500">{snapshot.pendingFixes}</div>
          <div className="text-xs text-gray-500">Pending Fixes</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {filters.map((f) => (
          <Button key={f} size="sm" variant="outline" className="text-xs px-2 py-1">
            {f}
          </Button>
        ))}
      </div>
      <div className="mb-2">
        <div className="text-xs text-gray-500 mb-1">Top Incident Categories</div>
        <div className="flex flex-wrap gap-2">
          {snapshot.topCategories.map((cat) => (
            <Badge key={cat} variant="secondary">{cat}</Badge>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <div className="text-xs text-gray-500 mb-1">Recommendations</div>
        <ul className="list-disc list-inside text-xs text-gray-700">
          {snapshot.recommendations.map((rec) => (
            <li key={rec}>{rec}</li>
          ))}
        </ul>
      </div>
      <div className="flex gap-4 mt-2">
        <div>
          <div className="text-lg font-bold text-pink-600">{snapshot.hallucinations}</div>
          <div className="text-xs text-gray-500">Hallucinations</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-600">{snapshot.autoFixedIncidents}</div>
          <div className="text-xs text-gray-500">Auto-fixed Incidents</div>
        </div>
      </div>
    </Card>
  );
} 