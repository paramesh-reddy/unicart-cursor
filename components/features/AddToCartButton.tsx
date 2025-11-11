"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Product, ProductVariant } from "@/types";

const REQUIRE_AUTH =
  process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant;
  quantity?: number;
  className?: string;
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
}

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  className,
  size = "default",
  showIcon = true,
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;

      if (REQUIRE_AUTH && !token) {
        alert("Please login to add items to cart");
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      });

      if (response.ok) {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        alert('Product added to cart successfully!');
        // Notify navbar of cart update
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      className={className}
      size={size}
      disabled={isAdded || isLoading}
    >
      <span className="flex items-center">
        {isAdded ? (
          <>
            <Check className={showIcon ? "mr-2 h-4 w-4" : "h-4 w-4"} />
            {showIcon && <span>Added!</span>}
          </>
        ) : isLoading ? (
          <>
            <ShoppingCart className={`${showIcon ? "mr-2 h-4 w-4" : "h-4 w-4"} animate-pulse`} />
            {showIcon && <span>Adding...</span>}
          </>
        ) : (
          <>
            <ShoppingCart className={showIcon ? "mr-2 h-4 w-4" : "h-4 w-4"} />
            {showIcon && <span>Add to Cart</span>}
          </>
        )}
      </span>
    </Button>
  );
}

