"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, User, Menu, X, Heart, LogOut, UserCircle, Package } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { SearchBar } from "@/components/features/SearchBar";
import { APP_NAME, NAV_LINKS, CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiurl } from "@/store/constants";
import axios from "axios";

export function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();

  // Check auth on mount and fetch counts
  useEffect(() => {
    setIsMounted(true);
    checkAuth();
    
    // Fetch counts if authenticated
    if (isAuthenticated) {
      const fetchCounts = async () => {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) return;

          // Fetch wishlist count
          const { data: wishlistData } = await axios.get(
            `${apiurl}/api/wishlist`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (wishlistData?.success) {
            setWishlistCount(wishlistData.wishlist?.length || 0);
          }

          // Fetch cart count
          const { data: cartData } = await axios.get(
            `${apiurl}/api/cart`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (cartData?.success) {
            const itemCount = cartData.cart?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;
            setCartCount(itemCount);
          }
        } catch (error) {
          console.error('Failed to fetch counts:', error);
        }
      };

      fetchCounts();
    } else {
      setWishlistCount(0);
      setCartCount(0);
    }
  }, [checkAuth, isAuthenticated]);

  // Listen for updates
  useEffect(() => {
    const handleUpdate = () => {
      if (isAuthenticated) {
        const fetchCounts = async () => {
          try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            // Fetch wishlist count
            const { data: wishlistData } = await axios.get(
              `${apiurl}/api/wishlist`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (wishlistData?.success) {
              setWishlistCount(wishlistData.wishlist?.length || 0);
            }

            // Fetch cart count
            const { data: cartData } = await axios.get(
              `${apiurl}/api/cart`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (cartData?.success) {
              const itemCount = cartData.cart?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;
              setCartCount(itemCount);
            }
          } catch (error) {
            console.error('Failed to fetch counts:', error);
          }
        };

        fetchCounts();
      }
    };

    window.addEventListener('wishlistUpdated', handleUpdate);
    window.addEventListener('cartUpdated', handleUpdate);
    return () => {
      window.removeEventListener('wishlistUpdated', handleUpdate);
      window.removeEventListener('cartUpdated', handleUpdate);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-primary-500 text-white py-2">
        <div className="container flex items-center justify-between text-sm">
          <p>Free shipping on orders over $100</p>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/help" className="hover:underline">
              Help
            </Link>
            <Link href="/track-order" className="hover:underline">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-500 text-white font-bold text-xl">
              U
            </div>
            <span className="text-2xl font-bold text-gray-900">{APP_NAME}</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <SearchBar className="w-full" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Wishlist */}
            <Link href="/wishlist" className="hidden md:block">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {isMounted && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Account */}
            {isMounted && isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                >
                  <UserCircle className="h-5 w-5" />
                  <span className="hidden md:block text-sm font-medium">
                    {user.firstName || user.email.split('@')[0]}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
                      <div className="p-3 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                        {user.role === "admin" && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="py-1">
                        <Link
                          href="/account"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <UserCircle className="h-4 w-4" />
                          My Profile
                        </Link>
                        <Link
                          href="/account/orders"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Package className="h-4 w-4" />
                          My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Heart className="h-4 w-4" />
                          Wishlist
                        </Link>
                        {user?.role === "admin" && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 font-medium"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Admin Dashboard
                          </Link>
                        )}
                      </div>
                      <div className="border-t py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {isMounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-6 py-3 border-t">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-primary-500 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          
          {/* Categories Dropdown */}
          <div className="relative group">
            <button className="text-sm font-medium text-gray-700 hover:text-primary-500 transition-colors">
              <span>All Categories</span>
            </button>
            <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-1">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container py-4 space-y-4">
            {/* Mobile Search */}
            <SearchBar className="w-full" />

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-gray-700 hover:text-primary-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile Categories */}
              <div className="pt-3 border-t">
                <p className="text-sm font-semibold text-gray-500 mb-2">Categories</p>
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="block py-2 text-sm text-gray-700 hover:text-primary-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

