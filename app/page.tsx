"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowRight, ShoppingBag, Truck, RefreshCw, Shield } from "lucide-react";
import productsData from "@/data/products.json";
import categoriesData from "@/data/categories.json";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch featured products and categories
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/products?featured=true&limit=6'),
          fetch('/api/categories')
        ]);

        if (productsResponse.ok) {
          const productsResponseData = await productsResponse.json();
          if (
            productsResponseData.success &&
            Array.isArray(productsResponseData.products) &&
            productsResponseData.products.length > 0
          ) {
            setFeaturedProducts(productsResponseData.products);
          } else {
            // Fallback to static data if API response is invalid
            console.warn('Invalid products response, using fallback data');
            const fallbackProducts = Array.isArray(productsData) ? productsData : (productsData as unknown as Product[]);
            setFeaturedProducts(Array.isArray(fallbackProducts) ? fallbackProducts.slice(0, 6) : []);
          }
        } else {
          // API returned error, use fallback
          console.warn('Products API error, using fallback data');
          const fallbackProducts = Array.isArray(productsData) ? productsData : (productsData as unknown as Product[]);
          setFeaturedProducts(Array.isArray(fallbackProducts) ? fallbackProducts.slice(0, 6) : []);
        }

        if (categoriesResponse.ok) {
          const categoriesResponseData = await categoriesResponse.json();
          if (
            categoriesResponseData.success &&
            Array.isArray(categoriesResponseData.categories) &&
            categoriesResponseData.categories.length > 0
          ) {
            setCategories(categoriesResponseData.categories);
          } else {
            // Fallback to static data if API response is invalid
            console.warn('Invalid categories response, using fallback data');
            setCategories(categoriesData as unknown as any[]);
          }
        } else {
          // API returned error, use fallback
          console.warn('Categories API error, using fallback data');
          setCategories(categoriesData as unknown as any[]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to static data
        const fallbackProducts = Array.isArray(productsData) ? productsData : (productsData as unknown as Product[]);
        const fallbackCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData as unknown as any[]);
        setFeaturedProducts(Array.isArray(fallbackProducts) ? fallbackProducts.slice(0, 6) : []);
        setCategories(Array.isArray(fallbackCategories) ? fallbackCategories : []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Welcome to{" "}
                <span className="text-yellow-300">UniCart</span>
              </h1>
              <p className="text-xl lg:text-2xl text-primary-100 leading-relaxed">
                Your one-stop destination for quality products at competitive prices. 
                Shop electronics, fashion, home goods, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Shop Now
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                    Browse Categories
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                  alt="Shopping Experience"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
                <Truck className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $100</p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
                <RefreshCw className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy on all items</p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold">Secure Shopping</h3>
              <p className="text-gray-600">Your data is protected with SSL encryption</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our wide range of products organized by category
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-white">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <span className="text-2xl">{category.icon || "📦"}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked products just for you
            </p>
          </div>
          {isMounted && featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-64">
                    <Image
                      src={product.images[0]?.url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format";
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4">{product.brand}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary-600">
                        ${product.price}
                      </span>
                      <Button onClick={() => addToCart(product)}>
                        <span>Add to Cart</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" variant="outline">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}