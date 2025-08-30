'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order, Address, PaymentMethod } from './types'
import type { CartItem } from './cartStore'
import { api } from './api'
import { useAuthStore } from './authStore'

type OrdersState = {
  orders: Order[]
  isLoading: boolean
  hasNewOrder: boolean
  init: (userId: string) => void
  placeOrder: (userId: string, items: CartItem[], address: Address, total: number, payment: PaymentMethod) => Promise<Order>
  clearNewOrderStatus: () => void
  clear: () => void
  syncWithBackend: () => Promise<void>
  loadFromBackend: (orders: Order[]) => void
}

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: true,
      hasNewOrder: false,
      init: (userId: string) => {
        set({ isLoading: false });
      },
      placeOrder: async (userId, items, address, total, payment) => {
        const { user } = useAuthStore.getState();
        
        const order: Order = {
          id: 'O' + Date.now().toString().slice(-6),
          createdAt: Date.now(),
          items: items.map(it => ({ productId: it.id, qty: it.qty, price: it.price, name: it.name, image: it.image })),
          total,
          address,
          payment,
          status: 'Pending',
        }
        
        // Add to backend if user is logged in
        if (user?.phoneNumber) {
          try {
            // For now, we'll skip backend sync for orders as the API method needs to be implemented
            console.log('Order created locally, backend sync pending');
          } catch (error) {
            console.error('Failed to save order to backend:', error);
          }
        }
        
        const newOrders = [order, ...get().orders];
        set({ orders: newOrders, hasNewOrder: true });
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('shopweve_orders', JSON.stringify(newOrders));
        }
        
        return order;
      },
      clearNewOrderStatus: async () => {
        set({ hasNewOrder: false });
      },
      clear: () => {
        set({ orders: [], isLoading: true, hasNewOrder: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('shopweve_orders');
        }
      },
      syncWithBackend: async () => {
        const { user } = useAuthStore.getState();
        if (!user?.phoneNumber) return;
        
        set({ isLoading: true });
        try {
          const orders = get().orders;
          for (const order of orders) {
            // Skip backend sync for now as API method needs implementation
            console.log('Syncing order:', order.id);
          }
        } catch (error) {
          console.error('Error syncing orders with backend:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      loadFromBackend: (orders: Order[]) => {
        if (!orders || orders.length === 0) {
          set({ orders: [] });
          return;
        }
        
        set({ orders });
        
        // Save to localStorage for offline access
        if (typeof window !== 'undefined') {
          localStorage.setItem('shopweve_orders', JSON.stringify(orders));
        }
        
        console.log('Loaded orders from backend:', orders);
      },
    }),
    {
      name: 'orders-storage',
    }
  )
);