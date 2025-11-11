"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Heart, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import type { CartItem } from "@/types";

const REQUIRE_AUTH =
  process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";

type HeaderMap = Record<string, string>;

export default function CartPage() {
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildAuthHeaders = (shouldAlert = false): HeaderMap | null => {
    if (typeof window === "undefined") return {} as HeaderMap;
    const token = localStorage.getItem('auth_token');
    if (REQUIRE_AUTH && !token) {
      if (shouldAlert) {
        alert("Please login to manage your cart.");
      }
      return null;
    }
    const headers: HeaderMap = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch cart data from API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const authHeaders = buildAuthHeaders();
        if (authHeaders === null) {
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/cart', {
          headers: authHeaders
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setItems(data.cart.items || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Calculate cart totals
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => {
    const price = typeof item.price === 'number' ? item.price : Number(item.price);
    return total + (price * item.quantity);
  }, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Handle quantity increment
  const handleIncrement = async (itemId: string, currentQuantity: number) => {
    try {
      const authHeaders = buildAuthHeaders(true);
      if (authHeaders === null) return;

      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: currentQuantity + 1 })
      });

      if (response.ok) {
        // Refresh cart data
        const cartResponse = await fetch('/api/cart', {
          headers: authHeaders
        });
        if (cartResponse.ok) {
          const data = await cartResponse.json();
          if (data.success) {
            setItems(data.cart.items || []);
            // Notify navbar of cart update
            window.dispatchEvent(new CustomEvent('cartUpdated'));
          }
        }
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // Handle quantity decrement (disabled at 1)
  const handleDecrement = async (itemId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) return;

    try {
      const authHeaders = buildAuthHeaders(true);
      if (authHeaders === null) return;

      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: currentQuantity - 1 })
      });

      if (response.ok) {
        // Refresh cart data
        const cartResponse = await fetch('/api/cart', {
          headers: authHeaders
        });
        if (cartResponse.ok) {
          const data = await cartResponse.json();
          if (data.success) {
            setItems(data.cart.items || []);
            // Notify navbar of cart update
            window.dispatchEvent(new CustomEvent('cartUpdated'));
          }
        }
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // Handle remove item
  const handleRemove = async (itemId: string) => {
    if (!confirm("Remove this item from cart?")) return;

    try {
      const authHeaders = buildAuthHeaders(true);
      if (authHeaders === null) return;

      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      if (response.ok) {
        // Remove item from local state
        setItems(items.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    try {
      // Remove all items one by one
      for (const item of items) {
        const authHeaders = buildAuthHeaders(true);
        if (authHeaders === null) return;

        await fetch(`/api/cart/${item.productId}`, {
          method: 'DELETE',
          headers: authHeaders
        });
      }

      setItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  // Handle apply promo code (mock functionality)
  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setPromoApplied(true);
      // In real app, you would validate the promo code here
    }
  };

  // Calculate shipping progress
  const shippingProgress = subtotal >= FREE_SHIPPING_THRESHOLD 
    ? 100 
    : (subtotal / FREE_SHIPPING_THRESHOLD) * 100;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-500">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {itemCount > 0 ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your cart` : 'Your cart is empty'}
          </p>
        </div>

        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Loading cart...</h2>
              <p className="text-gray-600">Please wait while we fetch your cart items</p>
            </div>
          </Card>
        ) : items.length === 0 ? (
          // Empty Cart State
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button asChild size="lg">
                <Link href="/products">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free Shipping Progress */}
              {shipping > 0 && (
                <Card className="p-4 bg-primary-50 border-primary-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-primary-900">
                      {remainingForFreeShipping > 0 
                        ? `Add ${formatPrice(remainingForFreeShipping)} more for FREE shipping!`
                        : '🎉 You qualify for FREE shipping!'
                      }
                    </p>
                  </div>
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min(shippingProgress, 100)}%` }}
                    />
                  </div>
                </Card>
              )}

              {/* Cart Items List */}
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link 
                        href={`/products/${item.product.slug}`}
                        className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100"
                      >
                        <Image
                          src={item.product.images?.[0]?.url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format"}
                          alt={item.product.images?.[0]?.alt || item.product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format";
                          }}
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={`/products/${item.product.slug}`}
                              className="font-semibold text-gray-900 hover:text-primary-500 line-clamp-2"
                            >
                              {item.product.name}
                            </Link>
                            {item.product.brand && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.product.brand}
                              </p>
                            )}
                            {item.variant && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.variant.name}
                              </p>
                            )}
                          </div>
                          
                          {/* Price - Desktop */}
                          <div className="hidden sm:block text-right">
                            <p className="font-bold text-primary-500">
                              {formatPrice(item.price)}
                            </p>
                            {item.product.comparePrice && item.product.comparePrice > item.price && (
                              <p className="text-sm text-gray-500 line-through">
                                {formatPrice(item.product.comparePrice)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Price - Mobile */}
                        <div className="sm:hidden mb-3">
                          <p className="font-bold text-primary-500">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity Controls & Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => handleDecrement(item.id, item.quantity)}
                              disabled={item.quantity <= 1}
                              className={`p-2 hover:bg-gray-100 transition-colors ${
                                item.quantity <= 1 
                                  ? 'opacity-40 cursor-not-allowed' 
                                  : 'hover:text-primary-500'
                              }`}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            
                            <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleIncrement(item.id, item.quantity)}
                              className="p-2 hover:bg-gray-100 hover:text-primary-500 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="text-sm font-semibold text-gray-900">
                            Total: {formatPrice(item.price * item.quantity)}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 ml-auto">
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <button
                              className="p-2 text-gray-500 hover:text-primary-500 hover:bg-primary-50 rounded-md transition-colors"
                              aria-label="Save for later"
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Stock Status */}
                        {item.product.stockQuantity > 0 && item.product.stockQuantity < 10 && (
                          <p className="text-sm text-orange-600 mt-2">
                            Only {item.product.stockQuantity} left in stock
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Clear Cart Button */}
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  className="text-red-600 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
                
                <Link href="/products">
                  <Button variant="ghost">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary - Right Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Enter code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="pl-10"
                          disabled={promoApplied}
                        />
                      </div>
                      <Button
                        onClick={handleApplyPromo}
                        variant="outline"
                        disabled={!promoCode.trim() || promoApplied}
                      >
                        Apply
                      </Button>
                    </div>
                    {promoApplied && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ Promo code applied
                      </p>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                      </span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Tax (estimated)
                      </span>
                      <span className="font-medium">{formatPrice(tax)}</span>
                    </div>

                    {promoApplied && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-{formatPrice(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center mb-6 pb-6 border-b">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary-500">
                      {formatPrice(total)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <Button asChild size="lg" className="w-full mb-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl">
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href="/products">
                      Continue Shopping
                    </Link>
                  </Button>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>30-Day Returns</span>
                    </div>
                    {shipping === 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Free Shipping</span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Recommended Products (Optional) */}
                <Card className="p-6 mt-4">
                  <h3 className="font-semibold mb-4">You Might Also Like</h3>
                  <p className="text-sm text-gray-600">
                    Based on items in your cart
                  </p>
                  {/* You can add recommended products here */}
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

