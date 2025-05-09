import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const incidents = [
  {
    id: "inc_78421",
    title: "Lead Prioritization Agent Drift",
    summary: "High-value leads ranked lower due to outdated product signals.",
    status: "Needs Review",
    time: "17 min ago",
    rcaLink: "/rca/lead-drift"
  },
  {
    id: "inc_78422",
    title: "Sales Chatbot Hallucination",
    summary: "Bot recommended an invalid pricing tier to customer.",
    status: "Auto-fixed",
    time: "42 min ago",
    rcaLink: "/rca/chatbot-pricing"
  },
  {
    id: "inc_78423",
    title: "Enrichment API Timeout",
    summary: "Fallback triggered due to CRM data API outage.",
    status: "Fixed",
    time: "2 hours ago",
    rcaLink: "/rca/fallback-enrichment"
  }
];

function statusBadge(status: string) {
  if (status === "Auto-fixed") return <Badge variant="success">Auto-fixed</Badge>;
  if (status === "Fixed") return <Badge variant="secondary">Fixed</Badge>;
  if (status === "Needs Review") return <Badge variant="destructive">Needs Review</Badge>;
  return <Badge variant="outline">{status}</Badge>;
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