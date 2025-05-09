import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const jobs = [
  {
    id: 1,
    name: "Retrain Finance Model",
    status: "In Progress",
    percent: 65,
    awaitingApproval: false,
  },
  {
    id: 2,
    name: "Feedback Incorporation",
    status: "Awaiting Approval",
    percent: 100,
    awaitingApproval: true,
  },
  {
    id: 3,
    name: "Update Data Pipeline",
    status: "Completed",
    percent: 100,
    awaitingApproval: false,
  },
];

function statusBadge(status: string) {
  if (status === "Completed") return <Badge variant="success">Completed</Badge>;
  if (status === "In Progress") return <Badge variant="secondary">In Progress</Badge>;
  return <Badge variant="destructive">Awaiting Approval</Badge>;
}

export default function RetrainingQueueCard() {
  return (
    <Card className="p-6 flex flex-col gap-4 bg-white shadow rounded-xl">
      <h2 className="text-lg font-bold mb-2">Retraining Queue / Feedback Actions</h2>
      <div className="flex flex-col gap-3">
        {jobs.map((job) => (
          <div key={job.id} className="border rounded-lg p-3 bg-gray-50 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{job.name}</span>
              {statusBadge(job.status)}
              {job.awaitingApproval && (
                <Badge variant="destructive" className="ml-2">Awaiting Approval</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={job.percent} className="w-32 h-2" />
              <span className="text-xs text-gray-500">{job.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 