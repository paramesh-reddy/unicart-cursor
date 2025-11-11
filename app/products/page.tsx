"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, SlidersHorizontal, Grid3x3, List, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/store/cartStore";
import { useSearchStore } from "@/store/searchStore";
import productsData from "@/data/products.json";
import categoriesData from "@/data/categories.json";
import { ProductCard } from "@/components/features/ProductCard";
import { SORT_OPTIONS } from "@/lib/constants";
import type { Product, Category } from "@/types";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const addItem = useCartStore((state) => state.addItem);
  const { searchProducts } = useSearchStore();

  // Load products and categories from API
  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch products and categories in parallel
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);

        if (productsResponse.ok) {
          const productsResponseData = await productsResponse.json();
          if (
            productsResponseData.success &&
            Array.isArray(productsResponseData.products) &&
            productsResponseData.products.length > 0
          ) {
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
            setCategories(categoriesData as unknown as Category[]);
          }
        } else {
          // API returned error, use fallback
          console.warn('Categories API error, using fallback data');
          setCategories(categoriesData as unknown as Category[]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to static data
        const fallbackProducts = Array.isArray(productsData) ? productsData : (productsData as unknown as Product[]);
        const fallbackCategories = Array.isArray(categoriesData) ? categoriesData : (categoriesData as unknown as Category[]);
        setProducts(Array.isArray(fallbackProducts) ? fallbackProducts : []);
        setCategories(Array.isArray(fallbackCategories) ? fallbackCategories : []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search query from URL
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Get unique brands
  const brands = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    return Array.from(new Set(safeProducts.map((p) => p.brand).filter(Boolean))) as string[];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    // Ensure products is always an array
    const safeProducts = Array.isArray(products) ? products : [];
    let filtered = [...safeProducts];

    // Apply search filter first
    if (searchQuery.trim()) {
      filtered = searchProducts(searchQuery, filtered);
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) =>
        selectedCategories.includes(p.categoryId)
      );
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter((p) => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter((p) => p.price <= parseFloat(priceRange.max));
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }

    // Rating filter
    if (selectedRating > 0) {
      filtered = filtered.filter((p) => p.rating.average >= selectedRating);
    }

    // Sort products
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating.average - a.rating.average);
        break;
      case "newest":
        filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        // Featured - products with isFeatured first
        filtered.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
        });
    }

    return filtered;
  }, [products, selectedCategories, priceRange, selectedBrands, selectedRating, sortBy, searchQuery, searchProducts]);

  // Handle category toggle
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Handle brand toggle
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: "", max: "" });
    setSelectedBrands([]);
    setSelectedRating(0);
  };

  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    // You can add a toast notification here
    console.log(`Added ${product.name} to cart`);
  };

  // Filters component
  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Clear Filters */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-primary-500 hover:text-primary-600"
        >
          Clear All
        </Button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-medium mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 cursor-pointer hover:text-primary-500"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
              />
              <span className="text-sm">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, min: e.target.value }))
            }
            className="w-20"
          />
          <span className="text-gray-500">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, max: e.target.value }))
            }
            className="w-20"
          />
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="font-medium mb-3">Brand</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 cursor-pointer hover:text-primary-500"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
              />
              <span className="text-sm">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="font-medium mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 cursor-pointer hover:text-primary-500"
            >
              <input
                type="radio"
                name="rating"
                checked={selectedRating === rating}
                onChange={() => setSelectedRating(rating)}
                className="w-4 h-4 text-primary-500 focus:ring-primary-500"
              />
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

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
            <span className="text-gray-900 font-medium">Products</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-lg border p-6">
              <FiltersContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  {searchQuery ? (
                    <p className="text-sm text-gray-600">
                      Search results for "<span className="font-semibold text-primary-600">{searchQuery}</span>" - 
                      <span className="font-medium text-gray-900 ml-1">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'result' : 'results'}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Showing <span className="font-medium text-gray-900">{filteredProducts.length}</span> of{" "}
                      <span className="font-medium text-gray-900">{Array.isArray(products) ? products.length : 0}</span> results
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Mobile Filter Button */}
                  <Button
                    variant="outline"
                    className="lg:hidden flex-1 sm:flex-none"
                    onClick={() => setShowMobileFilters(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* View Toggle - Desktop */}
                  <div className="hidden sm:flex items-center gap-1 border border-gray-300 rounded-md p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded ${
                        viewMode === "grid"
                          ? "bg-primary-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded ${
                        viewMode === "list"
                          ? "bg-primary-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {!isMounted || isLoading ? (
              <div className="bg-white rounded-lg border p-12 text-center">
                <p className="text-gray-500 text-lg mb-4">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg border p-12 text-center">
                <p className="text-gray-500 text-lg mb-4">No products found</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addItem}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100vh-140px)]">
              <FiltersContent />
            </div>
            <div className="p-4 border-t">
              <Button
                onClick={() => setShowMobileFilters(false)}
                className="w-full"
              >
                Show {filteredProducts.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

