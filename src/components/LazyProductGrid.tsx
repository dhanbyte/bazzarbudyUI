'use client'
import { memo, useMemo } from 'react'
import ProductCard from './ProductCard'
import type { Product } from '@/lib/types'

interface LazyProductGridProps {
  products: Product[]
  className?: string
}

const LazyProductGrid = memo(function LazyProductGrid({ products, className = '' }: LazyProductGridProps) {
  const memoizedProducts = useMemo(() => products, [products])
  
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${className}`}>
      {memoizedProducts.map((product) => (
        <ProductCard key={product.id} p={product} />
      ))}
    </div>
  )
})

export default LazyProductGrid
