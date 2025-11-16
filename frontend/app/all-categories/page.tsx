"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import categoriesData from "@/data/categories.json";
import productsData from "@/data/products.json";
import type { Category, Product } from "@/types";

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load categories and products
    setCategories(categoriesData as unknown as Category[]);
    
    const storedProducts = localStorage.getItem("unicart_admin_products");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(productsData as unknown as Product[]);
    }
  }, []);

  // Get product count for each category
  const getCategoryProductCount = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId).length;
  };

  // Filter categories by search
  const filteredCategories = categories.filter((category) => {
    if (!searchQuery) return true;
    return category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           category.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get featured products for each category
  const getCategoryFeaturedProducts = (categoryId: string) => {
    return products
      .filter(p => p.categoryId === categoryId)
      .slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Categories</h1>
          <p className="text-gray-600">Explore our complete range of product categories</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms
              </p>
              <Button
                onClick={() => setSearchQuery("")}
                variant="outline"
              >
                Clear Search
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const productCount = getCategoryProductCount(category.id);
              const featuredProducts = getCategoryFeaturedProducts(category.id);
              
              return (
                <Card key={category.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Category Header */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <Image
                      src={category.imageUrl || ""}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {category.name}
                      </h3>
                      <Badge variant="secondary" className="text-sm">
                        {productCount} {productCount === 1 ? "product" : "products"}
                      </Badge>
                    </div>
                  </div>

                  {/* Category Content */}
                  <div className="p-6">
                    {category.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    {/* Featured Products Preview */}
                    {featuredProducts.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Featured Products:</p>
                        <div className="flex gap-2">
                          {featuredProducts.map((product) => (
                            <div key={product.id} className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <Image
                                src={product.images[0]?.url || ""}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                          {featuredProducts.length === 3 && (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <span className="text-xs text-gray-500">+{productCount - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button asChild className="w-full group-hover:bg-primary-600 transition-colors">
                      <Link href={`/categories/${category.slug}`}>
                        Browse Category
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        <section className="mt-16">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-center mb-8">Shop by Numbers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {categories.length}
                </div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {products.length}
                </div>
                <div className="text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {products.filter(p => p.isFeatured).length}
                </div>
                <div className="text-gray-600">Featured Items</div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-12 text-center">
          <Card className="p-8 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="text-gray-600 mb-6">
              Browse our complete product catalog or contact our support team for assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/products">
                  <Package className="mr-2 h-5 w-5" />
                  Browse All Products
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/help">
                  Contact Support
                </Link>
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
