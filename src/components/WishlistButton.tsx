
'use client'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/lib/wishlistStore'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/authStore'
import { useToast } from '@/hooks/use-toast'

export default function WishlistButton({ id }: { id: string }) {
  const { user, isAuthenticated } = useAuthStore();
  const { ids, toggle } = useWishlist()
  const { toast } = useToast()
  const [isWished, setIsWished] = useState(false)

  // Sync state with the store whenever the ids array changes
  useEffect(() => {
    setIsWished(ids.includes(id))
  }, [ids, id])

  const handleToggle = () => {
    if (!user || !isAuthenticated) {
      toast({ title: "Please Login", description: "You need to be logged in to add items to your wishlist." });
      return;
    }
    toggle(id)
  }

  return (
    <motion.button 
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle Wishlist" 
      onClick={handleToggle} 
      className={`rounded-full p-2 transition-colors ${isWished ? 'bg-red-100 text-red-500' : 'bg-gray-100/80 text-gray-600 hover:bg-red-100/50 hover:text-red-500'}`}
    >
      <Heart className={`h-5 w-5 ${isWished ? 'fill-red-500' : 'fill-transparent'}`} />
    </motion.button>
  )
}
