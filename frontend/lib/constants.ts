/**
 * Application-wide constants
 */

export const APP_NAME = "UniCart";
export const APP_DESCRIPTION = "Modern E-Commerce Platform";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Navigation links
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Deals", href: "/deals" },
] as const;

// Category list
export const CATEGORIES = [
  { id: "1", name: "Electronics", slug: "electronics", icon: "Laptop" },
  { id: "2", name: "Fashion", slug: "fashion", icon: "Shirt" },
  { id: "3", name: "Home & Kitchen", slug: "home-kitchen", icon: "Home" },
  { id: "4", name: "Beauty", slug: "beauty", icon: "Sparkles" },
  { id: "5", name: "Sports", slug: "sports", icon: "Dumbbell" },
  { id: "6", name: "Books", slug: "books", icon: "Book" },
] as const;

// Product filters
export const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
  { label: "Best Rating", value: "rating" },
] as const;

// Pagination
export const ITEMS_PER_PAGE = 20;
export const PRODUCTS_PER_ROW_DESKTOP = 4;
export const PRODUCTS_PER_ROW_TABLET = 3;
export const PRODUCTS_PER_ROW_MOBILE = 2;

// Cart
export const MAX_CART_ITEMS = 50;
export const CART_STORAGE_KEY = "unicart_cart";

// Order status
export const ORDER_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
} as const;

// Payment status
export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

// Shipping methods
export const SHIPPING_METHODS = [
  { id: "standard", name: "Standard Shipping", days: "5-7", price: 9.99 },
  { id: "express", name: "Express Shipping", days: "2-3", price: 19.99 },
  { id: "overnight", name: "Next Day Delivery", days: "1", price: 29.99 },
] as const;

// Tax rate
export const TAX_RATE = 0.0725; // 7.25%

// Free shipping threshold
export const FREE_SHIPPING_THRESHOLD = 100;

// Featured badges
export const BADGES = {
  NEW: "New",
  SALE: "Sale",
  FEATURED: "Featured",
  BESTSELLER: "Best Seller",
  LIMITED: "Limited",
} as const;

// Social links
export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/unicart",
  twitter: "https://twitter.com/unicart",
  instagram: "https://instagram.com/unicart",
  linkedin: "https://linkedin.com/company/unicart",
} as const;

// Contact info
export const CONTACT_INFO = {
  email: "support@unicart.com",
  phone: "+1 (555) 123-4567",
  address: "123 Commerce St, San Francisco, CA 94105",
} as const;

// Footer links
export const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "Deals", href: "/deals" },
    { label: "New Arrivals", href: "/new" },
  ],
  customerService: [
    { label: "Contact Us", href: "/contact" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "FAQs", href: "/faq" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Accessibility", href: "/accessibility" },
  ],
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You must be logged in to perform this action.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  SERVER: "Server error. Please try again later.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ADDED_TO_CART: "Product added to cart!",
  REMOVED_FROM_CART: "Product removed from cart.",
  CART_UPDATED: "Cart updated successfully.",
  ORDER_PLACED: "Order placed successfully!",
  PROFILE_UPDATED: "Profile updated successfully.",
  ADDRESS_ADDED: "Address added successfully.",
  REVIEW_SUBMITTED: "Review submitted successfully.",
} as const;

