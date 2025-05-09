export default function FilterButton({ label }: { label: string }) {
  return (
    <button className="px-3 py-1 bg-gray-100 rounded text-xs font-medium hover:bg-blue-100">
      {label}
    </button>
  );
} 