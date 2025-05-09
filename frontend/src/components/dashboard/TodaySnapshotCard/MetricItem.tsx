export default function MetricItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
} 