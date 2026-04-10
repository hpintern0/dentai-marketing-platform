export default function CampanhasLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-40"></div>
        <div className="h-10 bg-gray-200 rounded w-44"></div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="h-10 bg-gray-200 rounded w-48"></div>
        <div className="h-10 bg-gray-200 rounded w-36"></div>
        <div className="h-10 bg-gray-200 rounded w-36"></div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="flex gap-4 p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
        </div>

        {/* Table rows */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-gray-50">
            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-8 h-8 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}
