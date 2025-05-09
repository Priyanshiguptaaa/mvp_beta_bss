import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

// Mock data
const hallucinationRate = [3.1, 2.9, 1.8, 4.2, 3.5, 2.1, 1.9]; // last 7 days
const driftTimeline = [0, 1, 2, 1, 0, 3, 1]; // drift events per day
const accuracySpread = [0.91, 0.88, 0.93, 0.85, 0.82, 0.89, 0.90]; // %

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const hallucinationData = days.map((day, i) => ({ day, value: hallucinationRate[i] }));
const driftData = days.map((day, i) => ({ day, value: driftTimeline[i] }));
const accuracyData = days.map((day, i) => ({ day, value: Math.round(accuracySpread[i] * 100) }));

export default function ModelReliabilityCard() {
  return (
    <Card className="p-6 flex flex-col gap-6 bg-white shadow rounded-xl">
      <h2 className="text-lg font-bold mb-2">Model Reliability</h2>
      {/* Hallucination Rate Bar Chart */}
      <div>
        <div className="text-xs text-gray-500 mb-1">Hallucination Rate (last 7 days, %)</div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hallucinationData}>
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Drift Detection Timeline Line Chart */}
      <div>
        <div className="text-xs text-gray-500 mb-1 mt-2">Drift Detection Timeline (events)</div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={driftData}>
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="value" stroke="#f59e42" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Accuracy Spread Line Chart */}
      <div>
        <div className="text-xs text-gray-500 mb-1 mt-2">Accuracy Spread (%)</div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={accuracyData}>
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} domain={[80, 100]} />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
} 