"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchStore } from "@/store/searchStore";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  showResults?: boolean;
}

export function SearchBar({ 
  className = "", 
  placeholder = "Search products...",
  showResults = true 
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    searchQuery,
    searchResults,
    isSearching,
    recentSearches,
    setSearchQuery,
    setSearchResults,
    setIsSearching,
    addRecentSearch,
    clearRecentSearches,
    searchProducts,
  } = useSearchStore();

  const debouncedQuery = useDebounce(localQuery, 300);

  // Load products
  useEffect(() => {
    const storedProducts = localStorage.getItem("unicart_admin_products");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // Fallback to default products
      import("@/data/products.json").then((module) => {
        setProducts(module.default as Product[]);
      });
    }
  }, []);

  // Handle search
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setIsSearching(true);
      const results = searchProducts(debouncedQuery, products);
      setSearchResults(results);
      setSearchQuery(debouncedQuery);
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setSearchQuery("");
    }
  }, [debouncedQuery, products, searchProducts, setSearchResults, setSearchQuery, setIsSearching]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    
    if (value.trim()) {
      setIsOpen(true);
    }
  };

  // Handle search submit
  const handleSearch = (query: string) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
      setIsOpen(false);
      // Navigate to products page with search query
      window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
    }
  };

  // Handle result click
  const handleResultClick = (product: Product) => {
    addRecentSearch(product.name);
    setIsOpen(false);
    setLocalQuery("");
  };

  // Handle clear search
  const handleClearSearch = () => {
    setLocalQuery("");
    setSearchResults([]);
    setSearchQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show recent searches when input is focused and empty
  const showRecentSearches = isOpen && !localQuery.trim() && recentSearches.length > 0;
  const showSearchResults = isOpen && localQuery.trim() && searchResults.length > 0;
  const showNoResults = isOpen && localQuery.trim() && !isSearching && searchResults.length === 0;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={localQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(localQuery);
            } else if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          className="pr-20"
        />
        
        {/* Search Button */}
        <Button
          size="icon"
          onClick={() => handleSearch(localQuery)}
          className="absolute right-1 top-1 h-8 w-8"
          disabled={!localQuery.trim()}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Dropdown */}
      {isOpen && showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto shadow-lg border z-50">
          <div className="p-4">
            {/* Recent Searches */}
            {showRecentSearches && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setLocalQuery(search);
                        handleSearch(search);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {showSearchResults && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Search Results ({searchResults.length})
                  </span>
                </div>
                <div className="space-y-3">
                  {searchResults.slice(0, 5).map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => handleResultClick(product)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={product.images[0]?.url || ""}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {product.brand} • {formatPrice(product.price)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {product.categoryId === "1" ? "Electronics" :
                         product.categoryId === "2" ? "Fashion" :
                         product.categoryId === "3" ? "Home" :
                         product.categoryId === "4" ? "Beauty" :
                         product.categoryId === "5" ? "Sports" : "Books"}
                      </Badge>
                    </Link>
                  ))}
                </div>
                
                {/* View All Results */}
                {searchResults.length > 5 && (
                  <div className="mt-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearch(localQuery)}
                      className="w-full"
                    >
                      View All {searchResults.length} Results
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {showNoResults && (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">No products found</p>
                <p className="text-xs text-gray-400">
                  Try searching for something else
                </p>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Searching...</p>
              </div>
            )}

            {/* Clear Search */}
            {localQuery.trim() && (
              <div className="mt-3 pt-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="w-full text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
