'use client'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';
import { useAuthStore } from './authStore';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  deliveryAddress: string;
}

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  createOrder: (orderData: {
    items: OrderItem[];
    total: number;
    deliveryAddress: string;
  }) => Promise<{ success: boolean; orderId?: string; message?: string }>;
  loadFromBackend: (userOrders: any[]) => void;
  syncWithBackend: () => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
}

export const useOrders = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      
      createOrder: async (orderData) => {
        const { user } = useAuthStore.getState();
        if (!user?.phoneNumber) {
          return { success: false, message: 'User not logged in' };
        }
        
        set({ isLoading: true });
        try {
          const result = await api.createOrder(user.phoneNumber, orderData.items, orderData.total, orderData.deliveryAddress);
          if (result.success && result.order) {
            const newOrder: Order = {
              orderId: result.order.orderId,
              items: result.order.items,
              total: result.order.total,
              status: result.order.status,
              orderDate: new Date(result.order.orderDate),
              deliveryAddress: result.order.deliveryAddress,
            };
            
            set(state => ({
              orders: [...state.orders, newOrder]
            }));
            
            return { success: true, orderId: newOrder.orderId };
          }
          return { success: false, message: 'Failed to create order' };
        } catch (error) {
          console.error('Error creating order:', error);
          return { success: false, message: 'Failed to create order' };
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadFromBackend: (userOrders: any[]) => {
        const orders: Order[] = userOrders.map(order => ({
          orderId: order.orderId,
          items: order.items,
          total: order.total,
          status: order.status,
          orderDate: new Date(order.orderDate),
          deliveryAddress: order.deliveryAddress,
        }));
        set({ orders });
        console.log('Loaded orders from backend:', orders);
      },
      
      syncWithBackend: async () => {
        const { user } = useAuthStore.getState();
        if (!user?.phoneNumber) return;
        
        set({ isLoading: true });
        try {
          const result = await api.getUserOrders(user.phoneNumber);
          if (result.success && result.orders) {
            get().loadFromBackend(result.orders);
          }
        } catch (error) {
          console.error('Error syncing orders with backend:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      getOrderById: (orderId: string) => {
        return get().orders.find(order => order.orderId === orderId);
      },
    }),
    {
      name: 'orders-storage',
    }
  )
);
