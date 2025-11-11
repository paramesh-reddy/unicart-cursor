"use client";

import { useState } from "react";
import { Heart, Star, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { Product } from "@/types";

const REQUIRE_AUTH =
  process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  showAddToCart?: boolean;
  className?: string;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  showAddToCart = true,
  className = "" 
}: ProductCardProps) {
  const [copied, setCopied] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  
  const discount = product.comparePrice ? calculateDiscount(product.price, product.comparePrice) : 0;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsWishlistLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem('auth_token')
          : null;

      if (REQUIRE_AUTH && !token) {
        alert('Please login to manage your wishlist');
        return;
      }

      if (isWishlisted) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist/${product.id}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (response.ok) {
          setIsWishlisted(false);
          alert('Removed from wishlist');
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            productId: product.id
          })
        });

        if (response.ok) {
          setIsWishlisted(true);
          alert('Added to wishlist');
          // Refresh wishlist count in navbar
          window.dispatchEvent(new CustomEvent('wishlistUpdated'));
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
      alert('Failed to update wishlist');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productUrl = `${window.location.origin}/products/${product.slug}`;
    
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = productUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-gray-200 text-gray-200" />
        );
      }
    }
    
    return stars;
  };

  return (
    <div className={`group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.images[0]?.url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format";
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isFeatured && (
            <Badge variant="primary" className="text-xs">
              Featured
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="error" className="text-xs">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className={`w-8 h-8 rounded-full transition-colors ${
              isWishlisted 
                ? "bg-red-500 text-white hover:bg-red-600" 
                : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
            } ${isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""} ${isWishlistLoading ? "animate-pulse" : ""}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="w-8 h-8 rounded-full bg-white/90 text-gray-600 hover:bg-white hover:text-blue-500"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Stock Status */}
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="text-sm">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        )}

        {/* Product Name */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {renderStars(product.rating.average)}
          </div>
          <span className="text-sm text-gray-500">
            ({product.rating.count})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {showAddToCart && (
          <Button
            onClick={handleAddToCart}
            className="w-full"
            disabled={product.stockQuantity === 0}
          >
            <span>
              {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
