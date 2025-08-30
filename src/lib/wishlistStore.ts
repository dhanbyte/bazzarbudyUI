'use client'
import { create } from 'zustand'

type WishlistState = {
  ids: string[]
  init: () => void
  add: (id: string) => void
  remove: (id: string) => void
  toggle: (id: string) => void
  clear: () => void
}

const STORAGE_KEY = 'shopweve_wishlist'

export const useWishlist = create<WishlistState>()((set, get) => ({
  ids: [],
  init: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const ids = JSON.parse(stored)
          set({ ids: Array.isArray(ids) ? ids : [] })
        } catch {
          set({ ids: [] })
        }
      }
    }
  },
  add: (id: string) => {
    const state = get()
    if (!state.ids.includes(id)) {
      const newIds = [...state.ids, id]
      set({ ids: newIds })
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds))
      }
    }
  },
  remove: (id: string) => {
    const state = get()
    const newIds = state.ids.filter(existingId => existingId !== id)
    set({ ids: newIds })
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds))
    }
  },
  toggle: (id: string) => {
    const state = get()
    if (state.ids.includes(id)) {
      state.remove(id)
    } else {
      state.add(id)
    }
  },
  clear: () => {
    set({ ids: [] })
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}))

// Initialize on load
if (typeof window !== 'undefined') {
  useWishlist.getState().init()
}
