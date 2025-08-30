'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/authStore'

interface LoginModalProps {
  isOpen: boolean
  onCloseAction: () => void
  onSuccess?: () => void
}

export default function LoginModal({ isOpen, onCloseAction, onSuccess }: LoginModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [name, setName] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'phone' | 'name'>('phone')
  
  const { login, isLoading, isAuthenticated, autoLogin } = useAuthStore()
  
  // Check if user is already authenticated when modal opens
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      // Try auto-login when modal opens
      autoLogin().then((success: boolean) => {
        if (success) {
          // Auto-login successful, close modal
          onSuccess?.();
          onCloseAction();
          resetForm();
        }
      });
    }
  }, [isOpen, isAuthenticated, autoLogin, onSuccess, onCloseAction]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate phone number
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('कृपया 10 अंकों का वैध फोन नंबर दर्ज करें')
      return
    }

    // Try login first (without name)
    const result = await login(phoneNumber)
    
    if (result) {
      // User exists, login successful
      onSuccess?.()
      onCloseAction()
      resetForm()
    } else {
      // New user, need name
      setIsNewUser(true)
      setStep('name')
    }
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('कृपया अपना नाम दर्ज करें')
      return
    }

    // Try login with name for new user
    const result = await login(phoneNumber + '|' + name)
    
    if (result) {
      onSuccess?.()
      onCloseAction()
      resetForm()
    } else {
      setError('Registration failed')
    }
  }

  const resetForm = () => {
    setPhoneNumber('')
    setName('')
    setError('')
    setStep('phone')
    setIsNewUser(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md mx-auto my-auto bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {step === 'phone' ? 'लॉगिन आवश्यक' : 'अपना नाम दर्ज करें'}
          </h2>
          <button
            onClick={() => {
              onCloseAction()
              resetForm()
            }}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="p-6 space-y-4">
            <p className="text-gray-600 text-sm mb-4">
              कार्ट में आइटम जोड़ने के लिए कृपया लॉगिन करें
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                फोन नंबर (10 अंक)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  setPhoneNumber(value)
                  setError('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand text-lg"
                placeholder="9876543210"
                required
                maxLength={10}
                pattern="\d{10}"
              />
              <p className="text-sm text-gray-500 mt-1">
                यदि आप नए उपयोगकर्ता हैं तो अगले स्टेप में नाम दर्ज करना होगा
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  onCloseAction()
                  resetForm()
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={isLoading || phoneNumber.length !== 10}
                className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-50"
              >
                {isLoading ? 'प्रतीक्षा करें...' : 'जारी रखें'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} className="p-6 space-y-4">
            <p className="text-gray-600 text-sm mb-4">
              नए उपयोगकर्ता के रूप में साइन अप करने के लिए अपना नाम दर्ज करें
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                आपका नाम
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="अपना पूरा नाम दर्ज करें"
                required
                maxLength={50}
              />
              <p className="text-sm text-gray-500 mt-1">
                फोन नंबर: +91 {phoneNumber}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setStep('phone')
                  setError('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                वापस जाएं
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-50"
              >
                {isLoading ? 'प्रतीक्षा करें...' : 'साइन अप करें'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
