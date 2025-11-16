import { useCartStore } from "@/store/cartStore";
import type { Product, ProductVariant } from "@/types";
import { toast } from "@/lib/toast";

/**
 * Custom hook for cart operations with toast notifications
 */
export function useCart() {
  const store = useCartStore();

  const addToCart = (
    product: Product,
    quantity: number = 1,
    variant?: ProductVariant
  ) => {
    try {
      store.addItem(product, quantity, variant);
      // Note: You'll need to implement a toast library
      console.log("Product added to cart!");
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  const removeFromCart = (itemId: string) => {
    try {
      store.removeItem(itemId);
      console.log("Product removed from cart");
    } catch (error) {
      console.error("Failed to remove product from cart:", error);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    try {
      store.updateQuantity(itemId, quantity);
      console.log("Cart updated");
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  };

  return {
    ...store,
    addToCart,
    removeFromCart,
    updateQuantity,
  };
}

