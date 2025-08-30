'use client'
import { useParams, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useProductStore } from '@/lib/productStore'
import ProductGrid from '@/components/ProductGrid'
import { ProductGridSkeleton } from '@/components/ProductCardSkeleton'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

const subcategoryMap: Record<string, string[]> = {
  'Tech Accessories': ['Audio', 'Adapters', 'Keyboards', 'Mice', 'Charging', 'Storage', 'Cameras', 'Mounts', 'Wearables'],
  'Home Accessories': ['Fragrance', 'Textiles', 'Kitchen', 'Decor', 'Storage', 'Lighting'],
  'Ayurvedic': ['Ayurvedic Medicine']
}

export default function CategoryPage() {
  const { category } = useParams()
  const searchParams = useSearchParams()
  const subcategory = searchParams.get('subcategory')
  const { products, isLoading } = useProductStore()

  const categoryName = decodeURIComponent(category as string)
  
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.category === categoryName && p.quantity > 0)
    
    if (subcategory) {
      filtered = filtered.filter(p => p.subcategory === subcategory)
    }
    
    return filtered
  }, [products, categoryName, subcategory])

  const availableSubcategories = useMemo(() => {
    const subs = new Set<string>()
    products
      .filter(p => p.category === categoryName && p.subcategory)
      .forEach(p => subs.add(p.subcategory!))
    return Array.from(subs)
  }, [products, categoryName])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading Products...</p>
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-1 text-sm text-gray-600 hover:text-brand">
          <ChevronLeft size={16} /> Home
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-sm font-medium">{categoryName}</span>
        {subcategory && (
          <>
            <span className="text-gray-400">/</span>
            <span className="text-sm font-medium">{subcategory}</span>
          </>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-2">
          {subcategory ? `${subcategory} - ${categoryName}` : categoryName}
        </h1>
        <p className="text-gray-600">{filteredProducts.length} products found</p>
      </div>

      {!subcategory && availableSubcategories.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableSubcategories.map(sub => (
              <Link
                key={sub}
                href={`/category/${encodeURIComponent(categoryName)}?subcategory=${encodeURIComponent(sub)}`}
                className="p-4 border rounded-lg hover:border-brand hover:shadow-md transition-all text-center"
              >
                <h3 className="font-medium">{sub}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {products.filter(p => p.category === categoryName && p.subcategory === sub && p.quantity > 0).length} items
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category.</p>
          <Link href="/" className="text-brand hover:underline mt-2 inline-block">
            Browse all products
          </Link>
        </div>
      )}
    </div>
  )
}
