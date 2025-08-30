'use client'
import { useState, useEffect } from 'react'
import type { Address } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { X } from 'lucide-react'

// Indian states for suggestions
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
];

// Major cities for suggestions
const MAJOR_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat',
  'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
  'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
  'Varanasi', 'Srinagar', 'Dhanbad', 'Jodhpur', 'Amritsar', 'Raipur', 'Allahabad',
  'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Madurai', 'Guwahati', 'Chandigarh',
  'Hubli-Dharwad', 'Amroha', 'Moradabad', 'Gurgaon', 'Aligarh', 'Solapur', 'Ranchi'
];

const required = (s?: string) => !!(s && s.trim().length)

export default function AddressForm({ onSubmitAction, initial, onCancel }: { onSubmitAction: (a: Address) => Promise<void>; initial?: Partial<Address>; onCancel?: () => void }) {
  const [a, setA] = useState<Omit<Address, 'id'>>({
    fullName: initial?.fullName || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    pincode: initial?.pincode || '',
    line1: initial?.line1 || '',
    line2: initial?.line2 || '',
    city: initial?.city || '',
    state: initial?.state || '',
    landmark: initial?.landmark || '',
    default: initial?.default ?? true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stateSuggestions, setStateSuggestions] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showStateSuggestions, setShowStateSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const { toast } = useToast();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!required(a.fullName)) newErrors.fullName = "Full name is required.";
    if (!/^\d{10}$/.test(a.phone)) newErrors.phone = "Must be a 10-digit phone number.";
    if (!required(a.email)) newErrors.email = "Email is required.";
    if (a.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) newErrors.email = "Please enter a valid email address.";
    if (!/^\d{6}$/.test(a.pincode)) newErrors.pincode = "Must be a 6-digit pincode.";
    if (!required(a.line1)) newErrors.line1 = "Address Line 1 is required.";
    if (!required(a.city)) newErrors.city = "City is required.";
    if (!required(a.state)) newErrors.state = "State is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handle = (k: keyof typeof a) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setA(prev => ({ ...prev, [k]: value }));
    
    // Handle state suggestions
    if (k === 'state') {
      if (value.length > 0) {
        const filtered = INDIAN_STATES.filter(state => 
          state.toLowerCase().includes(value.toLowerCase())
        );
        setStateSuggestions(filtered.slice(0, 5));
        setShowStateSuggestions(true);
      } else {
        setShowStateSuggestions(false);
      }
    }
    
    // Handle city suggestions
    if (k === 'city') {
      if (value.length > 0) {
        const filtered = MAJOR_CITIES.filter(city => 
          city.toLowerCase().includes(value.toLowerCase())
        );
        setCitySuggestions(filtered.slice(0, 5));
        setShowCitySuggestions(true);
      } else {
        setShowCitySuggestions(false);
      }
    }
  }
  
  const selectSuggestion = (type: 'state' | 'city', value: string) => {
    setA(prev => ({ ...prev, [type]: value }));
    if (type === 'state') {
      setShowStateSuggestions(false);
    } else {
      setShowCitySuggestions(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      
      // Show immediate optimistic feedback
      toast({
        title: "सेव हो रहा है...",
        description: "कृपया प्रतीक्षा करें"
      });
      
      try {
        const startTime = Date.now();
        await onSubmitAction({ ...initial, ...a });
        const endTime = Date.now();
        
        console.log(`Address save completed in ${endTime - startTime}ms`);
        
        setShowSuccess(true);
        toast({
          title: "पता सेव किया गया",
          description: "आपका पता सफलतापूर्वक सेव कर लिया गया है।"
        });
        
        // Reset form after successful save
        setA({
          fullName: '',
          phone: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
          default: false
        });
        
        setTimeout(() => setShowSuccess(false), 1500);
      } catch (error) {
        console.error('Error saving address:', error);
        toast({
          title: "त्रुटि",
          description: "पता सेव करने में समस्या हुई। कृपया पुनः प्रयास करें।"
        });
      } finally {
        setIsLoading(false);
      }
    }
  }

  const InputField = ({ name, placeholder, value, onChange, error }: { name: keyof Address, placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, error?: string }) => (
    <div>
      <input className={`w-full rounded-lg border px-3 py-2 text-sm ${error ? 'border-red-500' : 'border-gray-300'}`} placeholder={placeholder} value={value} onChange={onChange} />
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  )

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            value={a.email || ''}
            onChange={(e) => setA({ ...a, email: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand/20"
            placeholder="Email Address"
            autoComplete="email"
            inputMode="email"
            required
          />
          {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email}</div>}
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={a.phone}
            onChange={(e) => setA({ ...a, phone: e.target.value })}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
            autoComplete="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            required
          />
          {errors.phone && <div className="mt-1 text-xs text-red-600">{errors.phone}</div>}
        </div>
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          value={a.fullName}
          onChange={(e) => setA(prev => ({ ...prev, fullName: e.target.value }))}
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter your full name"
          autoComplete="name"
          required
        />
        {errors.fullName && <div className="mt-1 text-xs text-red-600">{errors.fullName}</div>}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Pincode</label>
          <input
            type="text"
            value={a.pincode}
            onChange={handle('pincode')}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="6-digit pincode"
            inputMode="numeric"
            maxLength={6}
            required
          />
          {errors.pincode && <div className="mt-1 text-xs text-red-600">{errors.pincode}</div>}
        </div>
        <div className="relative">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={a.city}
            onChange={handle('city')}
            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="City"
            required
          />
          {errors.city && <div className="mt-1 text-xs text-red-600">{errors.city}</div>}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
          <input
            type="text"
            value={a.line1}
            onChange={handle('line1')}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand ${errors.line1 ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="House No., Building, Street"
            required
          />
          {errors.line1 && <div className="mt-1 text-xs text-red-600">{errors.line1}</div>}
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
          <input
            type="text"
            value={a.line2 || ''}
            onChange={handle('line2')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="Area, Colony, Sector (Optional)"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={a.state}
            onChange={handle('state')}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="State"
            required
          />
          {errors.state && <div className="mt-1 text-xs text-red-600">{errors.state}</div>}
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
          <input
            type="text"
            value={a.landmark || ''}
            onChange={handle('landmark')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="Nearby landmark (Optional)"
          />
        </div>
        
        {/* Submit and Cancel Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-brand/90 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {isLoading ? 'सेव हो रहा है...' : 'पता सेव करें'}
          </button>
          
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="w-full sm:w-auto rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 mt-2 sm:mt-0"
            >
              रद्द करें
            </button>
          )}
        </div>
      </div>
      
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" onClick={() => setShowSuccess(false)}>
          <div className="bg-white rounded-lg p-4 max-w-xs w-full mx-4 relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowSuccess(false)} 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">पता सेव हो गया!</h3>
              <p className="text-sm text-gray-500 text-center">आपका पता सफलतापूर्वक सेव कर लिया गया है।</p>
            </div>
          </div>
        </div>
      )}
      </form>
    </div>
  )
}
