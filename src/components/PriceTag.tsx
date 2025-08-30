export default function PriceTag({ original, discounted, currency = '₹' }: { original: number; discounted?: number; currency?: string }) {
  // Handle cases where original might be undefined or null
  const safeOriginal = original || 0
  const safeDiscounted = discounted || 0
  const price = discounted ?? safeOriginal
  const off = discounted ? Math.round(((safeOriginal - safeDiscounted) / safeOriginal) * 100) : 0
  return (
    <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
      <span className="text-sm sm:text-lg font-semibold">{currency}{price.toLocaleString('en-IN')}</span>
      {discounted && (
        <>
          <span className="text-xs sm:text-sm text-gray-400 line-through">{currency}{safeOriginal.toLocaleString('en-IN')}</span>
          <span className="text-[10px] sm:text-xs font-medium text-green-600">{off}% off</span>
        </>
      )}
    </div>
  )
}
