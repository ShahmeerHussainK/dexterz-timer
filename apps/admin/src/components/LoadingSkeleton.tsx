export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 w-64 bg-gray-200 rounded-lg"></div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
      <div className="h-96 bg-gray-200 rounded-xl"></div>
    </div>
  )
}
