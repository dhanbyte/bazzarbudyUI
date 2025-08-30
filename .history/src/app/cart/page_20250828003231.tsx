'use client'
import { useCart } from '@/lib/cartStore'
import QtyCounter from '@/components/QtyCounter'
import Link from 'next/link'
import PriceTag from '@/components/PriceTag'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'

export default function CartPage(){
  const { items, setQty, remove, total } = useCart()
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Your Cart</h1>
      {items.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center">
          <h2 className="text-lg font-medium text-gray-700">Your cart is empty.</h2>
          <p className="text-sm text-gray-500 mt-1">Looks like you havent added anything to your cart yet.</p>
          <Link href="/" className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90">Start Shopping</Link>
        </div>
      )}
      {items.length > 0 && (
        <div className="grid gap-6 md:grid-cols-[1fr_320px] md:items-start">
          <div className="space-y-3">
            {items.map(it => (
              <div key={it.id} className="card flex items-center gap-4 p-3">
                <div className="relative h-20 w-20 shrink-0">
                    <Image src={it.image} alt={it.name} fill className="rounded-xl object-cover"/>
                </div>
                <div className="flex-1">
                  <div className="line-clamp-2 font-medium text-sm">{it.name}</div>
                  <div className="mt-1"><PriceTag original={it.price} /></div>
                  <div className="mt-2"><QtyCounter value={it.qty} onChange={n=>setQty(it.id, n)} /></div>
                </div>
                <button onClick={()=>remove(it.id)} className="rounded-lg border p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200" aria-label="Remove item">
                    <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="card sticky top-24 p-4">
            <div className="text-lg font-semibold">Price Details</div>
            <div className="mt-3 space-y-2 border-b pb-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Delivery</span>
                <span>Free</span>
              </div>
            </div>
            <div className="mt-3 flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <Link href="/checkout" className="mt-4 block w-full rounded-xl bg-brand py-2.5 text-center font-semibold text-white transition-colors hover:bg-brand/90">Checkout</Link>
          </div>
        </div>
      )}
    </div>
  )
}
