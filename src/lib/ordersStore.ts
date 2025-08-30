'use client'
import { create } from 'zustand'
import type { Order, Address, PaymentMethod } from './types'
import type { CartItem } from './cartStore'

type OrdersState = {
  orders: Order[]
  hasNewOrder: boolean
  init: (userId: string) => void
  placeOrder: (userId: string, items: CartItem[], address: Address, total: number, paymentMethod: PaymentMethod) => Promise<void>
  markAsRead: () => void
  updateOrderStatus: (orderId: string, status: Order['status']) => void
}

const STORAGE_KEY = 'shopweve_orders'

export const useOrders = create<OrdersState>()((set, get) => ({
  orders: [],
  hasNewOrder: false,
  init: (userId: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`)
      if (stored) {
        try {
          const orders = JSON.parse(stored)
          set({ orders: Array.isArray(orders) ? orders : [] })
        } catch {
          set({ orders: [] })
        }
      }
    }
  },
  placeOrder: async (userId: string, items: CartItem[], address: Address, total: number, paymentMethod: PaymentMethod) => {
    const newOrder: Order = {
      id: `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      items: items.map(item => ({
        productId: item.id,
        qty: item.qty,
        price: item.price,
        name: item.name,
        image: item.image
      })),
      total,
      address,
      payment: paymentMethod,
      status: 'Pending'
    }
    
    const state = get()
    const newOrders = [newOrder, ...state.orders]
    set({ orders: newOrders, hasNewOrder: true })
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(newOrders))
    }
  },
  markAsRead: () => {
    set({ hasNewOrder: false })
  },
  updateOrderStatus: (orderId: string, status: Order['status']) => {
    const state = get()
    const updatedOrders = state.orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    )
    set({ orders: updatedOrders })
    
    // Update localStorage for all users (admin functionality)
    if (typeof window !== 'undefined') {
      // This is a simplified approach - in a real app you'd need proper user management
      const keys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_KEY))
      keys.forEach(key => {
        try {
          const orders = JSON.parse(localStorage.getItem(key) || '[]')
          const updated = orders.map((order: Order) =>
            order.id === orderId ? { ...order, status } : order
          )
          localStorage.setItem(key, JSON.stringify(updated))
        } catch {}
      })
    }
  }
}))
