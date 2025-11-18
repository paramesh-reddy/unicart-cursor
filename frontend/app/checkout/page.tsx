"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types";
import { apiurl } from "@/store/constants";

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ShippingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    country: "United States",
  });
  const [errors, setErrors] = useState<Partial<ShippingFormData>>({});

  // Fetch cart items for order summary
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setCartLoading(false);
          return;
        }

        const response = await fetch(`${apiurl}/api/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setItems(data.cart.items || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Check authentication and cart before allowing checkout
  useEffect(() => {
    const checkAccess = async () => {
      await checkAuth();
      
      // Wait a moment for auth state to update
      setTimeout(async () => {
        const { isAuthenticated: authState, user: userState } = useAuthStore.getState();
        
        if (!authState) {
          router.push("/login");
          return;
        }
        
        // Check if cart has items by fetching from API
        const token = localStorage.getItem('auth_token');
        let itemCount: number = 0;
        if (token) {
          try {
            const cartResponse = await fetch(`${apiurl}/api/cart`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (cartResponse.ok) {
              const cartData = await cartResponse.json();
              itemCount = cartData.cart?.items?.length || 0;
            }
          } catch (error) {
            console.error('Failed to check cart:', error);
          }
        }
        
        if (itemCount === 0) {
          router.push("/cart");
          return;
        }

        // Pre-fill form with user data if available
        if (userState) {
          setFormData(prev => ({
            ...prev,
            email: userState.email,
            firstName: userState.firstName || "",
            lastName: userState.lastName || "",
          }));
        }
      }, 100);
    };

    checkAccess();
  }, [checkAuth, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ShippingFormData]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "ZIP/Postal code is required";
    } else {
      // Accept various postal code formats:
      // - US: 5 digits or 5-4 format (12345 or 12345-6789)
      // - India: 6 digits (515001)
      // - Canada: A1A 1A1 format (alphanumeric)
      // - UK: Various formats (SW1A 1AA, etc.)
      // For now, accept 4-10 alphanumeric characters with optional spaces/hyphens
      const postalCodeRegex = /^[A-Z0-9\s-]{4,10}$/i;
      if (!postalCodeRegex.test(formData.pincode.trim())) {
        newErrors.pincode = "Please enter a valid postal code";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Save shipping info to localStorage for payment page
      localStorage.setItem("checkout_shipping", JSON.stringify(formData));
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to payment page
      router.push("/payment");
    } catch (error) {
      console.error("Error processing checkout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking access
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAccess(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : Number(item.price);
    return sum + (price * item.quantity);
  }, 0);
  
  const shipping = subtotal >= 100 ? 0 : 9.99; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;
  const isFreeShipping = shipping === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order securely</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Truck className="w-4 h-4 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold">Shipping Information</h2>
              </div>

              <form className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? "border-red-500" : ""}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? "border-red-500" : ""}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? "border-red-500" : ""}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? "border-red-500" : ""}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={errors.address ? "border-red-500" : ""}
                    placeholder="Enter your street address"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-2">
                    Apartment, suite, etc. (optional)
                  </label>
                  <Input
                    id="apartment"
                    name="apartment"
                    type="text"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={errors.city ? "border-red-500" : ""}
                      placeholder="Enter city"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={errors.state ? "border-red-500" : ""}
                      placeholder="Enter state"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <Input
                      id="pincode"
                      name="pincode"
                      type="text"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={errors.pincode ? "border-red-500" : ""}
                      placeholder="12345"
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="India">India</option>
                  </select>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 shadow-sm sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>

              {/* Cart Items */}
              {cartLoading ? (
                <div className="space-y-4 mb-6">
                  <div className="text-sm text-gray-500">Loading cart items...</div>
                </div>
              ) : items.length === 0 ? (
                <div className="space-y-4 mb-6">
                  <div className="text-sm text-gray-500">No items in cart</div>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {items.map((item) => {
                    const itemPrice = typeof item.price === 'number' ? item.price : Number(item.price);
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.product.images?.[0]?.url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format";
                            }}
                          />
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.variant ? `${item.variant.name} • ` : ""}
                            {formatPrice(itemPrice)}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(itemPrice * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Order Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {isFreeShipping ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{formatPrice(tax)}</span>
                </div>
                
                <div className="flex justify-between text-lg font-semibold border-t pt-3">
                  <span>Total</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {!isFreeShipping && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Free shipping at $100
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Add {formatPrice(100 - subtotal)} more for free shipping
                  </p>
                </div>
              )}

              {/* Security Badge */}
              <div className="flex items-center gap-2 mt-4 p-3 bg-green-50 rounded-lg">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Secure checkout with SSL encryption
                </span>
              </div>

              {/* Continue to Payment Button */}
              <Button
                onClick={handleContinueToPayment}
                disabled={isLoading}
                className="w-full mt-6 h-12 text-lg font-medium bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Continue to Payment
                  </div>
                )}
              </Button>

              {/* Trust Signals */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Your payment information is secure and encrypted
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}