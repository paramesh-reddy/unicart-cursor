import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/types";

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getItemCount: () => number;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const items = get().items;
        const exists = items.some(item => item.id === product.id);
        
        if (!exists) {
          set({ items: [...items, product] });
        }
      },
      
      removeItem: (productId) => {
        const items = get().items.filter(item => item.id !== productId);
        set({ items });
      },
      
      isInWishlist: (productId) => {
        return get().items.some(item => item.id === productId);
      },
      
      getItemCount: () => {
        return get().items.length;
      },
      
      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "unicart_wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
