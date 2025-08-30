'use client'

export default function ProductCardSkeleton() {
  return (
    <div className="card p-2 flex flex-col animate-pulse">
      <div className="relative">
        <div className="w-full h-32 bg-gray-200 rounded"></div>
        <div className="absolute right-1 top-1 w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
      <div className="flex-grow flex flex-col pt-2 px-1">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="mt-2">
          <div className="h-9 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
