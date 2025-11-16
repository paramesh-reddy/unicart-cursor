import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/types";

interface SearchStore {
  searchQuery: string;
  searchResults: Product[];
  isSearching: boolean;
  recentSearches: string[];
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Product[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  searchProducts: (query: string, products: Product[]) => Product[];
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      searchQuery: "",
      searchResults: [],
      isSearching: false,
      recentSearches: [],

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSearchResults: (results: Product[]) => {
        set({ searchResults: results });
      },

      setIsSearching: (isSearching: boolean) => {
        set({ isSearching });
      },

      addRecentSearch: (query: string) => {
        if (!query.trim()) return;
        
        const currentSearches = get().recentSearches;
        const newSearches = [
          query.trim(),
          ...currentSearches.filter(search => search !== query.trim())
        ].slice(0, 5); // Keep only 5 recent searches
        
        set({ recentSearches: newSearches });
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      searchProducts: (query: string, products: Product[]) => {
        if (!query.trim()) return [];

        const searchTerm = query.toLowerCase().trim();
        
        return products.filter((product) => {
          // Search in product name
          const nameMatch = product.name.toLowerCase().includes(searchTerm);
          
          // Search in product brand
          const brandMatch = product.brand?.toLowerCase().includes(searchTerm);
          
          // Search in product description
          const descriptionMatch = product.description.toLowerCase().includes(searchTerm);
          
          // Search in category name (you might need to map categoryId to category name)
          const categoryMatch = searchTerm.includes("electronics") && product.categoryId === "1" ||
                              searchTerm.includes("fashion") && product.categoryId === "2" ||
                              searchTerm.includes("home") && product.categoryId === "3" ||
                              searchTerm.includes("kitchen") && product.categoryId === "3" ||
                              searchTerm.includes("beauty") && product.categoryId === "4" ||
                              searchTerm.includes("sports") && product.categoryId === "5" ||
                              searchTerm.includes("books") && product.categoryId === "6";
          
          return nameMatch || brandMatch || descriptionMatch || categoryMatch;
        });
      },
    }),
    {
      name: "unicart_search",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    }
  )
);
