'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Package, Heart, Phone, Edit2, Settings, MapPin, HelpCircle, Clock, Star } from 'lucide-react';
import { useAuthStore } from '../lib/authStore';
import { useCart } from '../lib/cartStore';
import { useWishlist } from '../lib/wishlistStore';
import { api } from '../lib/api';
import { useOrders } from '../lib/orderStore';
import AddressManager from './AddressManager';

interface UserProfileProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function UserProfile({ isOpen, onCloseAction }: UserProfileProps) {
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const { items: cartItems } = useCart();
  const { ids: wishlistIds } = useWishlist();
  const { orders } = useOrders();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newName.trim()) {
      setError('कृपया नाम दर्ज करें');
      return;
    }

    const result = await updateProfile(newName.trim());
    if (result.success) {
      setIsEditing(false);
      setError('');
    } else {
      setError(result.message);
    }
  };

  const handleLogout = () => {
    logout();
    onCloseAction();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto my-auto max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">मेरा अकाउंट</h2>
          <button
            onClick={onCloseAction}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              प्रोफाइल
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'orders' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              ऑर्डर ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'wishlist' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              विशलिस्ट ({wishlistIds.length})
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'support' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <HelpCircle className="w-4 h-4 inline mr-2" />
              सहायता
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'addresses' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">सहेजे गए पते</h3>
            <AddressManager onBackAction={() => setActiveTab('profile')} />
          </div>
        )}

        {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* User Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      +91 {user.phoneNumber}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">सत्यापित ग्राहक</p>
                  </div>
                </div>
              </div>

          {isEditing ? (
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-2">
                  नया नाम
                </label>
                <input
                  type="text"
                  id="newName"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  maxLength={50}
                />
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
                    setIsEditing(false);
                    setNewName(user.name);
                    setError('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'अपडेट हो रहा है...' : 'अपडेट करें'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">खाता सेटिंग्स</h4>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  नाम बदलें
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  लॉग आउट
                </button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">पता प्रबंधन</h4>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className="w-full flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  पते देखें/जोड़ें
                </button>
                
                <h4 className="font-semibold text-gray-900 mt-6">त्वरित लिंक</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      मेरे ऑर्डर
                    </span>
                    <span className="text-sm text-gray-500">{orders.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-2" />
                      विशलिस्ट
                    </span>
                    <span className="text-sm text-gray-500">{wishlistIds.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('support')}
                    className="w-full flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    सहायता केंद्र
                  </button>
                </div>
              </div>
            </div>
          )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">मेरे ऑर्डर</h3>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">अभी तक कोई ऑर्डर नहीं</p>
                  <button
                    onClick={onCloseAction}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    शॉपिंग शुरू करें
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">ऑर्डर #{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString('hi-IN')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'delivered' ? 'डिलीवर हो गया' :
                           order.status === 'shipped' ? 'भेजा गया' :
                           order.status === 'processing' ? 'प्रोसेसिंग' : 'पेंडिंग'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.items.length} आइटम</p>
                      <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">मेरी विशलिस्ट</h3>
              {wishlistIds.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">विशलिस्ट खाली है</p>
                  <button
                    onClick={onCloseAction}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    प्रोडक्ट्स देखें
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlistIds.slice(0, 6).map((id) => (
                    <div key={id} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div>
                          <p className="font-medium">प्रोडक्ट #{id.slice(-6)}</p>
                          <p className="text-sm text-gray-500">विशलिस्ट में जोड़ा गया</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {wishlistIds.length > 6 && (
                    <div className="md:col-span-2 text-center py-4">
                      <button
                        onClick={onCloseAction}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        सभी {wishlistIds.length} आइटम देखें
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">सहायता केंद्र</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Phone className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-medium">कस्टमर केयर</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">24/7 सहायता उपलब्ध</p>
                  <div className="space-y-2">
                    <p className="text-sm">📞 <strong>1800-123-4567</strong></p>
                    <p className="text-sm">📧 <strong>support@shopwave.com</strong></p>
                    <p className="text-sm">💬 <strong>लाइव चैट</strong></p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <HelpCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-medium">सामान्य प्रश्न</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>• ऑर्डर ट्रैकिंग कैसे करें?</p>
                    <p>• रिटर्न पॉलिसी क्या है?</p>
                    <p>• पेमेंट के तरीके</p>
                    <p>• डिलीवरी की जानकारी</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Star className="w-5 h-5 text-yellow-600 mr-2" />
                    <h4 className="font-medium">फीडबैक दें</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">आपका अनुभव कैसा रहा?</p>
                  <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                    रेटिंग दें
                  </button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Settings className="w-5 h-5 text-gray-600 mr-2" />
                    <h4 className="font-medium">खाता सेटिंग्स</h4>
                  </div>
                  <div className="space-y-2">
                    <button className="w-full text-left text-sm py-1 hover:text-blue-600">प्राइवेसी सेटिंग्स</button>
                    <button className="w-full text-left text-sm py-1 hover:text-blue-600">नोटिफिकेशन सेटिंग्स</button>
                    <button className="w-full text-left text-sm py-1 hover:text-blue-600">पेमेंट मेथड</button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
