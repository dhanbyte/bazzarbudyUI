'use client'
import { motion } from 'framer-motion'
import { ShoppingBag, Loader2 } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <ShoppingBag className="h-16 w-16 text-brand" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ShopWeve</h1>
          <p className="text-gray-600">Loading your shopping experience...</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-center space-x-2"
        >
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
          <span className="text-gray-600">Please wait</span>
        </motion.div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.5, duration: 2 }}
          className="mt-8 h-1 bg-brand rounded-full max-w-xs mx-auto"
        />
      </div>
    </div>
  )
}
