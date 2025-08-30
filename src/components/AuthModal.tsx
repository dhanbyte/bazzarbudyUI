'use client'

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function AuthModal({ isOpen, onCloseAction }: AuthModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'name'>('phone');
  const [isChecking, setIsChecking] = useState(false);
  
  const { login, isLoading, isAuthenticated, autoLogin } = useAuthStore();
  
  // Check if user is already authenticated when modal opens
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      // Try auto-login when modal opens
      autoLogin().then(success => {
        if (success) {
          // Auto-login successful, close modal
          onCloseAction();
          resetForm();
        }
      });
    }
  }, [isOpen, isAuthenticated, autoLogin, onCloseAction]);

  // Real-time phone number check
  useEffect(() => {
    const checkPhone = async () => {
      if (phoneNumber.length === 10) {
        setIsChecking(true);
        const result = await api.checkPhoneExists(phoneNumber);
        if (result.exists && result.user) {
          // Auto-login existing user
          const loginResult = await login(phoneNumber);
          if (loginResult.success) {
            onCloseAction();
            resetForm();
          }
        } else {
          // New user - show name input
          setIsNewUser(true);
          setStep('name');
        }
        setIsChecking(false);
      }
    };

    if (phoneNumber.length === 10 && step === 'phone') {
      checkPhone();
    }
  }, [phoneNumber, step, login, onCloseAction]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone number
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('कृपया 10 अंकों का वैध फोन नंबर दर्ज करें');
      return;
    }

    // Phone validation already handled by useEffect
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('कृपया अपना नाम दर्ज करें');
      return;
    }

    const result = await login(phoneNumber, name.trim());
    
    if (result.success) {
      onCloseAction();
      setPhoneNumber('');
      setName('');
      setStep('phone');
      setIsNewUser(false);
    } else {
      setError(result.message);
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setName('');
    setError('');
    setStep('phone');
    setIsNewUser(false);
    setIsChecking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto my-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'phone' ? 'लॉगिन / साइन अप' : 'अपना नाम दर्ज करें'}
          </h2>
          <button
            onClick={() => {
              onCloseAction();
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                फोन नंबर (10 अंक)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(value);
                    setError('');
                  }}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  required
                  maxLength={10}
                  pattern="\d{10}"
                />
                {isChecking && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {phoneNumber.length === 10 && isChecking ? 
                  'जाँच रहे हैं...' : 
                  'फोन नंबर डालते ही आटोमेटिक लॉगिन हो जाएगा'
                }
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || phoneNumber.length !== 10 || isChecking}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isChecking ? 'जाँच रहे हैं...' : isLoading ? 'प्रतीक्षा करें...' : 'जारी रखें'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                आपका नाम
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="अपना पूरा नाम दर्ज करें"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
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

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setError('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                वापस जाएं
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isLoading ? 'प्रतीक्षा करें...' : 'साइन अप करें'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            लॉगिन करके आप हमारी सेवा की शर्तों से सहमत हैं
          </p>
        </div>
      </div>
    </div>
  );
}
