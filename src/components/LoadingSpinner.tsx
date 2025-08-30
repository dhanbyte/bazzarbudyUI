'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-brand ${sizeClasses[size]}`} />
      {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
    </div>
  )
}
