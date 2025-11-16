import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, Product, ProductVariant } from "@/types";
import { CART_STORAGE_KEY, TAX_RATE, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { apiurl } from "@/store/constants";
import axios from "axios";

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  
  // Actions
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  
  // Computed values
  getItemCount: () => number;
  getSubtotal: () => number;
  getShipping: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemById: (itemId: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // Helper to return auth header if token exists
      // This mirrors the previous apiClient behavior
      // by attaching Authorization automatically when available.
      // Note: This function is defined inline to avoid
      // introducing a new shared module per user request.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // @ts-ignore - used within methods below
      _getAuthHeaders: (): Record<string, string> => {
        if (typeof window === "undefined") return {};
        const token = localStorage.getItem("auth_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
      },

      fetchCart: async () => {
        try {
          const headers = (get() as any)._getAuthHeaders?.() || {};
          const { data } = await axios.get(`${apiurl}/api/cart`, { headers });
          if (data?.success) {
            set({ items: data.cart?.items || [] });
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        }
      },

      addItem: async (product, quantity = 1, variant) => {
        try {
          set({ isLoading: true });
          const headers = (get() as any)._getAuthHeaders?.() || {};
          const { data } = await axios.post(
            `${apiurl}/api/cart`,
            {
              productId: product.id,
              quantity: quantity,
            },
            { headers }
          );

          if (data?.success) {
            // Refresh cart from server
            await get().fetchCart();
          }
        } catch (error) {
          console.error('Failed to add item to cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (itemId) => {
        try {
          set({ isLoading: true });
          // Find the product ID from the item
          const item = get().items.find(item => item.id === itemId);
          if (!item) return;

          const headers = (get() as any)._getAuthHeaders?.() || {};
          await axios.delete(`${apiurl}/api/cart/${item.productId}`, { headers });
          
          // Refresh cart from server
          await get().fetchCart();
        } catch (error) {
          console.error('Failed to remove item from cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (itemId, quantity) => {
        try {
          if (quantity < 1) return;

          set({ isLoading: true });
          // Find the product ID from the item
          const item = get().items.find(item => item.id === itemId);
          if (!item) return;

          const headers = (get() as any)._getAuthHeaders?.() || {};
          await axios.put(
            `${apiurl}/api/cart/${item.productId}`,
            { quantity },
            { headers }
          );

          // Refresh cart from server
          await get().fetchCart();
        } catch (error) {
          console.error('Failed to update cart item:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        try {
          set({ isLoading: true });
          // Remove all items one by one
          const items = get().items;
          const headers = (get() as any)._getAuthHeaders?.() || {};
          for (const item of items) {
            await axios.delete(`${apiurl}/api/cart/${item.productId}`, { headers });
          }

          // Refresh cart from server
          await get().fetchCart();
        } catch (error) {
          console.error('Failed to clear cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99;
      },

      getTax: () => {
        return get().getSubtotal() * TAX_RATE;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getShipping() + get().getTax();
      },

      getItemById: (itemId) => {
        return get().items.find((item) => item.id === itemId);
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

