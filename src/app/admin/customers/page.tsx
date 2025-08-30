'use client';

import { useEffect, useState } from 'react';
import { adminApi, type User } from '@/lib/adminApi';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching users from API...');
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('👥 Admin users API response:', data);
      
      let users = [];
      if (data.success && Array.isArray(data.data)) {
        users = data.data;
      } else if (Array.isArray(data)) {
        users = data;
      }
      
      console.log(`✅ Loaded ${users.length} users for admin`);
      setUsers(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMessage = 'An error occurred while fetching users. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const originalUsers = [...users];
    
    // Optimistic UI update
    setUsers(users.map(user => 
      user._id === userId ? { ...user, isActive: !currentStatus } : user
    ));

    try {
      const result = await adminApi.updateUserStatus(userId, !currentStatus);
      
      if (result.success) {
        toast.success(result.message || `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        // Revert on failure
        setUsers(originalUsers);
        toast.error(result.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      // Revert on failure
      setUsers(originalUsers);
      toast.error('A network error occurred. Failed to update user status.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Failed to Load Customers</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={fetchUsers}
            className="px-6 py-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
            <span className="px-3 py-1 text-sm font-medium bg-brand-light text-brand-dark rounded-full">
              {users.length} {users.length === 1 ? 'User' : 'Users'}
            </span>
          </div>
          <p className="mt-2 text-gray-600">View, activate, or deactivate registered users.</p>
        </header>

        <main className="bg-white rounded-xl shadow-lg overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-lg font-medium text-gray-800">No Customers Found</h3>
              <p className="mt-2 text-gray-500">There are no registered customers to display at the moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Member Since
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                             <div className="h-10 w-10 rounded-full bg-brand-light flex items-center justify-center">
                               <span className="text-brand-dark font-semibold">
                                 {user.name?.charAt(0).toUpperCase() || 'U'}
                               </span>
                             </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name || 'Unnamed User'}</div>
                            <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', year: 'numeric', month: 'short', day: 'numeric' }) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          className={`w-24 text-center py-1 rounded-md transition-colors ${
                            user.isActive 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link 
                          href={`/admin/customers/${user._id}`}
                          className="ml-4 text-brand hover:text-brand-dark font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
