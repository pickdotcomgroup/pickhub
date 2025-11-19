export default function ApplicationCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Title and Status */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
          
          {/* Description */}
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          
          {/* Meta Info Row 1 */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          
          {/* Meta Info Row 2 */}
          <div className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-28"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
        {[1, 2, 3, 4].map((j) => (
          <div key={j} className="h-6 bg-gray-200 rounded-full w-16"></div>
        ))}
      </div>
    </div>
  );
}
