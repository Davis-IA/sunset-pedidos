export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-3">
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-12 mt-1" />
        <div className="h-7 bg-gray-200 rounded-xl w-full mt-2" />
      </div>
    </div>
  )
}
