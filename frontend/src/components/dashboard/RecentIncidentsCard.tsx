import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const incidents = [
  {
    id: 1,
    title: "Finance Agent Failure",
    summary: "Model failed to process Q2 report queries.",
    status: "Needs review",
    statusColor: "orange",
    time: "12 min ago",
    rcaLink: "/rca/1"
  },
  {
    id: 2,
    title: "Data Drift Detected",
    summary: "Input distribution drifted from baseline.",
    status: "Auto-fixed",
    statusColor: "green",
    time: "1 hr ago",
    rcaLink: "/rca/2"
  },
  {
    id: 3,
    title: "API Timeout Spike",
    summary: "API response time exceeded threshold.",
    status: "Fixed",
    statusColor: "blue",
    time: "2 hrs ago",
    rcaLink: "/rca/3"
  },
];

function statusBadge(status: string) {
  if (status === "Auto-fixed") return <Badge variant="success">Auto-fixed</Badge>;
  if (status === "Fixed") return <Badge variant="secondary">Fixed</Badge>;
  return <Badge variant="destructive">Needs review</Badge>;
}

export default function RecentIncidentsCard() {
  return (
    <Card className="p-6 flex flex-col gap-4 bg-white shadow rounded-xl">
      <h2 className="text-lg font-bold mb-2">Top 3 Recent Incidents</h2>
      <div className="flex flex-col gap-3">
        {incidents.map((incident) => (
          <div key={incident.id} className="border rounded-lg p-3 bg-gray-50 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{incident.title}</span>
              {statusBadge(incident.status)}
              <span className="text-xs text-gray-400 ml-auto">{incident.time}</span>
            </div>
            <div className="text-xs text-gray-700 mb-1">{incident.summary}</div>
            <Link href={incident.rcaLink} className="text-xs text-blue-600 hover:underline font-medium w-fit">
              View RCA
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
} 