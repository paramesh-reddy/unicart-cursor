"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CreditCard, Lock, CheckCircle, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { 
    items, 
    getSubtotal, 
    getShipping, 
    getTax, 
    getTotal, 
    clearCart 
  } = useCartStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });
  const [shippingData, setShippingData] = useState<any>(null);

  useEffect(() => {
    // Get shipping data from localStorage
    const savedShipping = localStorage.getItem("checkout_shipping");
    if (savedShipping) {
      setShippingData(JSON.parse(savedShipping));
    } else {
      router.push("/checkout");
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "cardNumber") {
      // Format card number with spaces
      const formatted = value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
      setPaymentData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === "expiryDate") {
      // Format expiry date MM/YY
      const formatted = value.replace(/\D/g, "").replace(/(.{2})/, "$1/").slice(0, 5);
      setPaymentData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === "cvv") {
      // Limit CVV to 3-4 digits
      const formatted = value.replace(/\D/g, "").slice(0, 4);
      setPaymentData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setPaymentData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Clear cart and shipping data
      clearCart();
      localStorage.removeItem("checkout_shipping");
      
      // Redirect to success page
      router.push("/checkout/success");
    } catch (error) {
      console.error("Payment failed:", error);
      setIsProcessing(false);
    }
  };

  if (!shippingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment...</p>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/checkout"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Checkout
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600 mt-2">Complete your secure payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold">Payment Information</h2>
              </div>

              <div className="space-y-6">
                {/* Card Number */}
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="font-mono"
                  />
                </div>

                {/* Card Name */}
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
                    Name on Card *
                  </label>
                  <Input
                    id="cardName"
                    name="cardName"
                    type="text"
                    value={paymentData.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date *
                    </label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      type="text"
                      value={paymentData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <Input
                      id="cvv"
                      name="cvv"
                      type="text"
                      value={paymentData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={4}
                      className="font-mono"
                    />
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Your payment information is encrypted and secure
                  </span>
                </div>
              </div>
            </Card>

            {/* Shipping Summary */}
            <Card className="p-6 shadow-sm mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Truck className="w-4 h-4 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold">Shipping Address</h3>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {shippingData.firstName} {shippingData.lastName}
                </p>
                <p>{shippingData.address}</p>
                {shippingData.apartment && <p>{shippingData.apartment}</p>}
                <p>
                  {shippingData.city}, {shippingData.state} {shippingData.pincode}
                </p>
                <p>{shippingData.country}</p>
                <p className="mt-2">{shippingData.email}</p>
                <p>{shippingData.phone}</p>
              </div>
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
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.product.images[0]?.url || ""}
                        alt={item.product.name}
                        fill
                        className="object-cover"
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
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shipping === 0 ? (
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

              {/* Pay Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full mt-6 h-12 text-lg font-medium bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Pay ₹{total.toFixed(2)}
                  </div>
                )}
              </Button>

              {/* Security Badge */}
              <div className="flex items-center gap-2 mt-4 p-3 bg-green-50 rounded-lg">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Complete your secure payment
                </span>
              </div>

              {/* Trust Signals */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Protected by 256-bit SSL encryption
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
