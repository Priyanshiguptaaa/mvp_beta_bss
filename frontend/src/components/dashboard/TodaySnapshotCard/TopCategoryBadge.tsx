export default function TopCategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2 text-xs font-medium">
      {category}
    </span>
  );
} 