'use client'
import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
}

export default function OptimizedImage({ 
  src, 
  alt, 
  width = 400, 
  height = 400, 
  className = '', 
  priority = false,
  fill = false 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Fix invalid /api/placeholder URLs and ensure valid image src
  let fixedSrc = src || '/placeholder-product.svg'
  
  if (src && src.includes('/api/placeholder/400/400')) {
    fixedSrc = src.replace('/api/placeholder/400/400', 'https://images.unsplash.com/')
  } else if (!src || src === '') {
    fixedSrc = '/placeholder-product.svg'
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : `w-[${width}px] h-[${height}px]`} ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {hasError ? (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded">
          <div className="text-gray-400 text-xs">No Image</div>
        </div>
      ) : (
        <Image
          src={fixedSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          className={`${fill ? 'object-cover' : 'object-contain'} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true)
            setIsLoading(false)
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={75}
          unoptimized={true}
        />
      )}
    </div>
  )
}
