
'use client'
import { useWishlist } from '@/lib/wishlistStore'
import { PRODUCTS } from '@/lib/sampleData'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function WishlistPage() {
  const { ids } = useWishlist()
  const wishedProducts = PRODUCTS.filter(p => ids.includes(p.id))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
      {wishedProducts.length === 0 ? (
        <div className="text-center py-10 rounded-xl border bg-white">
            <Heart className="mx-auto h-12 w-12 text-gray-300" />
            <h2 className="mt-4 text-lg font-medium text-gray-700">Your wishlist is empty.</h2>
            <p className="text-sm text-gray-500 mt-1">Looks like you havent added anything yet. Start exploring!</p>
            <Link href="/" className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {wishedProducts.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  )
}
