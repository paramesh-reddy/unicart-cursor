"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Tag, Clock, Percent, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProductCard } from "@/components/features/ProductCard";
import { useCartStore } from "@/store/cartStore";
import productsData from "@/data/products.json";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { Product } from "@/types";

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"discount" | "price" | "name">("discount");

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    // Load products
    const storedProducts = localStorage.getItem("unicart_admin_products");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(productsData as unknown as Product[]);
    }
  }, []);

  // Filter products with discounts
  const dealProducts = products.filter((product) => {
    return product.comparePrice && product.comparePrice > product.price;
  });

  // Sort products
  const sortedProducts = [...dealProducts].sort((a, b) => {
    const discountA = calculateDiscount(a.price, a.comparePrice || a.price);
    const discountB = calculateDiscount(b.price, b.comparePrice || b.price);

    switch (sortBy) {
      case "discount":
        return discountB - discountA;
      case "price":
        return a.price - b.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Get top deals (highest discounts)
  const topDeals = sortedProducts.slice(0, 3);

  // Get limited time offers (products with high discounts)
  const limitedTimeOffers = sortedProducts.filter((product) => {
    const discount = calculateDiscount(product.price, product.comparePrice || product.price);
    return discount >= 30; // 30% or more discount
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Deals & Offers</h1>
          <p className="text-gray-600">Discover amazing discounts and limited-time offers</p>
        </div>

        {/* Top Deals Section */}
        {topDeals.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Tag className="w-4 h-4 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold">Top Deals</h2>
              </div>
              <Badge variant="error" className="text-sm">
                Limited Time
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topDeals.map((product) => {
                const discount = calculateDiscount(product.price, product.comparePrice || product.price);
                return (
                  <Card key={product.id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    {/* Discount Badge */}
                    <div className="absolute top-4 left-4 z-10">
                  <Badge variant="error" className="text-sm font-bold">
                    -{discount}% OFF
                  </Badge>
                    </div>

                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Image
                        src={product.images[0]?.url || ""}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl font-bold text-red-600">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(product.comparePrice || 0)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-orange-600 font-medium">
                          Limited Time Offer
                        </span>
                      </div>

                      <Button className="w-full">
                        Shop Now
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Limited Time Offers */}
        {limitedTimeOffers.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold">Limited Time Offers</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {limitedTimeOffers.slice(0, 4).map((product) => {
                const discount = calculateDiscount(product.price, product.comparePrice || product.price);
                return (
                  <Card key={product.id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-2 right-2 z-10">
                    <Badge variant="error" className="text-xs">
                      -{discount}%
                    </Badge>
                    </div>
                    
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Image
                        src={product.images[0]?.url || ""}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-medium text-sm line-clamp-2 mb-2">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          {formatPrice(product.comparePrice || 0)}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* All Deals Section */}
        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <Percent className="w-4 h-4 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold">All Deals</h2>
              <Badge variant="secondary" className="text-sm">
                {sortedProducts.length} offers
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "discount" | "price" | "name")}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="discount">Sort by Discount</option>
                <option value="price">Sort by Price</option>
                <option value="name">Sort by Name</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-l-lg ${
                    viewMode === "grid"
                      ? "bg-primary-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-r-lg ${
                    viewMode === "list"
                      ? "bg-primary-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          {sortedProducts.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Tag className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No deals available</h3>
                <p className="text-gray-600 mb-4">
                  Check back soon for amazing deals and discounts
                </p>
                <Button asChild>
                  <Link href="/products">
                    Browse All Products
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addItem}
                  className={viewMode === "list" ? "flex flex-row items-center" : ""}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
