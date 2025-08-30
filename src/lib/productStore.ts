'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from './types'
import { api } from './api'

type ProductState = {
  products: Product[]
  categories: string[]
  isLoading: boolean
  lastFetch: number | null
  init: () => void
  syncWithBackend: () => Promise<void>
  addProduct: (product: Product) => Promise<boolean>
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>
  deleteProduct: (id: string) => Promise<boolean>
  getProductsByCategory: (category: string) => Product[]
  searchProducts: (query: string) => Product[]
  getProductById: (id: string) => Product | undefined
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      categories: [],
      isLoading: true,
      lastFetch: null,
      
      init: async () => {
        const state = get();
        const now = Date.now();
        
        console.log('🚀 ProductStore init called, current products:', state.products.length);
        
        // Always fetch fresh data for debugging
        set({ isLoading: true });
        await get().syncWithBackend();
      },
      
      syncWithBackend: async () => {
        try {
          console.log('🔄 Fetching products from Next.js API routes...');
          set({ isLoading: true });
          
          // Fetch all products using Next.js API routes
          const allProducts = await api.getAllProducts();
          
          console.log(`📊 Total products fetched: ${allProducts.length}`);
          console.log('📦 Products data:', allProducts);
          
          if (allProducts.length > 0) {
            const uniqueCategories = [...new Set(allProducts.map((p: Product) => p.category).filter(Boolean))] as string[];
            set({ 
              products: allProducts, 
              categories: uniqueCategories,
              isLoading: false, 
              lastFetch: Date.now() 
            });
            console.log(`✅ Successfully loaded ${allProducts.length} products with categories:`, uniqueCategories);
            console.log('✅ ProductStore state updated:', get().products.length);
          } else {
            console.log("⚠️ No products found from API");
            set({ 
              products: [], 
              categories: [],
              isLoading: false, 
              lastFetch: Date.now() 
            });
          }
        } catch (error) {
          console.error("❌ Error syncing with API:", error);
          set({ 
            products: [], 
            categories: [], 
            isLoading: false,
            lastFetch: Date.now()
          });
        }
      },
      
      addProduct: async (product: Product) => {
        try {
          const success = await api.addProduct(product);
          if (success) {
            // Add to local state immediately for better UX
            const state = get();
            const newProducts = [...state.products, product];
            const categories = [...new Set(newProducts.map(p => p.category))];
            set({ products: newProducts, categories });
            
            // Sync with backend to get updated data
            setTimeout(() => get().syncWithBackend(), 1000);
          }
          return success;
        } catch (error) {
          console.error("Error adding product:", error);
          return false;
        }
      },
      
      updateProduct: async (id: string, updatedProduct: Partial<Product>) => {
        try {
          const success = await api.updateProduct(id, updatedProduct);
          if (success) {
            const state = get();
            const products = state.products.map(p => 
              p.id === id ? { ...p, ...updatedProduct } : p
            );
            const categories = [...new Set(products.map(p => p.category))];
            set({ products, categories });
          }
          return success;
        } catch (error) {
          console.error("Error updating product:", error);
          return false;
        }
      },
      
      deleteProduct: async (id: string) => {
        try {
          const success = await api.deleteProduct(id);
          if (success) {
            const state = get();
            const products = state.products.filter(p => p.id !== id);
            const categories = [...new Set(products.map(p => p.category))];
            set({ products, categories });
          }
          return success;
        } catch (error) {
          console.error("Error deleting product:", error);
          return false;
        }
      },
      
      getProductsByCategory: (category: string) => {
        return get().products.filter(p => p.category === category);
      },
      
      searchProducts: (query: string) => {
        const products = get().products;
        const lowercaseQuery = query.toLowerCase();
        return products.filter(p => 
          p.name.toLowerCase().includes(lowercaseQuery) ||
          p.category.toLowerCase().includes(lowercaseQuery) ||
          p.brand.toLowerCase().includes(lowercaseQuery) ||
          p.description?.toLowerCase().includes(lowercaseQuery)
        );
      },
      
      getProductById: (id: string) => {
        return get().products.find(p => p.id === id);
      }
    }),
    {
      name: 'product-store',
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
        lastFetch: state.lastFetch
      })
    }
  )
);

// Initialize the store immediately for all pages
if (typeof window !== 'undefined') {
  useProductStore.getState().init();
}