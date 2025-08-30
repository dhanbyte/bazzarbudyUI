'use client'
import { useState } from 'react'

interface SimpleImageProps {
  src: string
  alt: string
  className?: string
}

export default function SimpleImage({ src, alt, className = '' }: SimpleImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fix invalid /api/placeholder URLs
  let fixedSrc = src || '/placeholder-product.svg'
  
  if (src && src.includes('/api/placeholder/400/400')) {
    fixedSrc = src.replace('/api/placeholder/400/400', 'https://images.unsplash.com/')
  }

  if (hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-xs">No Image</div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={fixedSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
      />
    </div>
  )
}
