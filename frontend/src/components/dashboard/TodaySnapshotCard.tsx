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

export default function TodaySnapshotCard() {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{snapshot.incidents}</span>
          <span className="text-xs text-gray-500">Incidents</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{snapshot.failedTests}</span>
          <span className="text-xs text-gray-500">Failed Tests</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{snapshot.autoFixed}</span>
          <span className="text-xs text-gray-500">Auto-fixed</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{snapshot.pendingFixes}</span>
          <span className="text-xs text-gray-500">Pending Fixes</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{snapshot.hallucinations}</span>
          <span className="text-xs text-gray-500">Hallucinations</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{snapshot.autoFixedIncidents}</span>
          <span className="text-xs text-gray-500">Auto-fixed Incidents</span>
        </div>
      </div>
      <div className="mb-2">
        {snapshot.topCategories.map(cat => (
          <span key={cat} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2 text-xs font-medium">
            {cat}
          </span>
        ))}
      </div>
      <div className="mb-2">
        {snapshot.recommendations.map(rec => (
          <div key={rec} className="text-sm text-green-700 mb-1">{rec}</div>
        ))}
      </div>
      <div className="flex gap-2">
        {snapshot.filters.map(filter => (
          <button key={filter} className="px-3 py-1 bg-gray-100 rounded text-xs font-medium hover:bg-blue-100">
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
} 