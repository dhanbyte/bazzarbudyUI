'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminApi, AdminOrder } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Package, AlertCircle, RefreshCw, ChevronDown, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const statusColors: { [key: string]: string } = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const StatusDropdown = ({ order, onStatusChange }: { order: AdminOrder; onStatusChange: (orderId: string, newStatus: OrderStatus) => void; }) => {
  const [isOpen, setIsOpen] = useState(false);
  const validStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const handleStatusClick = (newStatus: OrderStatus) => {
    if (newStatus !== order.status) {
      onStatusChange(order.orderId, newStatus);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${statusColors[order.status.toLowerCase()]}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          <ChevronDown className="-mr-1 ml-2 h-5 w-5" />
        </button>
      </div>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {validStatuses.map((status) => (
              <a
                key={status}
                href="#"
                onClick={() => handleStatusClick(status)}
                className={`${status === order.status ? 'font-bold text-indigo-600' : 'text-gray-700'} block px-4 py-2 text-sm hover:bg-gray-100`}
                role="menuitem">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching orders from API...');
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📋 Admin orders API response:', data);
      
      let orders = [];
      if (data.success && Array.isArray(data.data)) {
        orders = data.data;
      } else if (Array.isArray(data)) {
        orders = data;
      }
      
      console.log(`✅ Loaded ${orders.length} orders for admin`);
      setOrders(orders);
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const originalOrders = [...orders];
    // Optimistic update
    setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));

    const result = await adminApi.updateOrderStatus(orderId, newStatus);

    if (result.success) {
      toast({
        title: 'Status updated',
        description: result.message || 'Order status changed successfully'
      });
    } else {
      // Revert on failure
      setOrders(originalOrders);
      toast({
        title: 'Update failed',
        description: result.message || 'Failed to update status.'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 px-4">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-lg font-medium text-red-800">Failed to load orders</h3>
        <p className="mt-1 text-sm text-red-600">Error: {error}</p>
        <div className="mt-6">
          <Button
            onClick={fetchOrders}
            variant="destructive"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Customer Orders</h1>
        <Button variant="outline" onClick={fetchOrders}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">There are currently no orders to display.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Order ID</th>
                  <th scope="col" className="px-6 py-3">Customer</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Items</th>
                  <th scope="col" className="px-6 py-3">Total</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      #{order.orderId.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <div>{order.userName}</div>
                      <div className="text-xs text-gray-500">{order.userPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.orderDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">{order.itemCount}</td>
                    <td className="px-6 py-4 font-semibold">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusDropdown order={order} onStatusChange={handleStatusChange} />
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders/${order.orderId}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
