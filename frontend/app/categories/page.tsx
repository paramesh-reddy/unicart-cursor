"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ProductCard } from "@/components/features/ProductCard";
import { useCartStore } from "@/store/cartStore";
import categoriesData from "@/data/categories.json";
import productsData from "@/data/products.json";
import type { Category, Product } from "@/types";
import { apiurl } from "@/store/constants";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories from API
        const categoriesResponse = await fetch(`${apiurl}/api/categories`);
        if (categoriesResponse.ok) {
          const categoriesResponseData = await categoriesResponse.json();
          if (categoriesResponseData.success && categoriesResponseData.categories && Array.isArray(categoriesResponseData.categories)) {
            setCategories(categoriesResponseData.categories);
          } else {
            // Fallback to static data if API response is invalid
            console.warn('Invalid categories response, using fallback data');
            const fallbackCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData as unknown as Category[]);
            setCategories(Array.isArray(fallbackCategories) ? fallbackCategories : []);
          }
        } else {
          // API returned error, use fallback
          console.warn('Categories API error, using fallback data');
          const fallbackCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData as unknown as Category[]);
          setCategories(Array.isArray(fallbackCategories) ? fallbackCategories : []);
        }

        // Fetch ALL products from API (use a high limit to get all products)
        const productsResponse = await fetch(`${apiurl}/api/products?limit=1000`);
        if (productsResponse.ok) {
          const productsResponseData = await productsResponse.json();
          if (productsResponseData.success && productsResponseData.products && Array.isArray(productsResponseData.products)) {
            setProducts(productsResponseData.products);
          } else {
            // Fallback to static data if API response is invalid
            console.warn('Invalid products response, using fallback data');
            const fallbackProducts = Array.isArray(productsData) ? productsData : (productsData as unknown as Product[]);
            setProducts(Array.isArray(fallbackProducts) ? fallbackProducts : []);
          }
        } else {
          // API returned error, use fallback
          console.warn('Products API error, using fallback data');
          const fallbackProducts = Array.isArray(productsData) ? productsData : (productsData as unknown as Product[]);
          setProducts(Array.isArray(fallbackProducts) ? fallbackProducts : []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to static data
        const fallbackCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData as unknown as Category[]);
        const fallbackProducts = Array.isArray(productsData) ? productsData : (productsData as unknown as Product[]);
        setCategories(Array.isArray(fallbackCategories) ? fallbackCategories : []);
        setProducts(Array.isArray(fallbackProducts) ? fallbackProducts : []);
      }
    };

    fetchData();
  }, []);

  // Filter products by category and search
  const filteredProducts = (Array.isArray(products) ? products : []).filter((product) => {
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const getCategoryProductCount = (categoryId: string) => {
    const safeProducts = Array.isArray(products) ? products : [];
    return safeProducts.filter(p => p.categoryId === categoryId).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-gray-600">Browse products by category</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">All Categories</h2>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedCategory
                      ? "bg-primary-100 text-primary-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>All Categories</span>
                    <span className="text-sm text-gray-500">
                      {Array.isArray(products) ? products.length : 0}
                    </span>
                  </div>
                </button>
                
                {Array.isArray(categories) && categories.map((category) => {
                  const productCount = getCategoryProductCount(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? "bg-primary-100 text-primary-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        <span className="text-sm text-gray-500">
                          {productCount}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {selectedCategory ? getCategoryName(selectedCategory) : "All Products"}
                </h2>
                <span className="text-gray-500">
                  {filteredProducts.length} products
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>

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
            {filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Grid className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "No products available in this category"}
                  </p>
                  {searchQuery && (
                    <Button
                      onClick={() => setSearchQuery("")}
                      variant="outline"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <div className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addItem}
                    className={viewMode === "list" ? "flex flex-row items-center" : ""}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
