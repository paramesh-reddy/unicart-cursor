"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Package, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiurl } from "@/store/constants";

export default function OrderSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear cart after successful order
    const clearCart = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Fetch current cart and remove items one by one (backend expects productId)
          const cartRes = await fetch(`${apiurl}/api/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (cartRes.ok) {
            const cartData = await cartRes.json();
            const items = cartData?.cart?.items || [];
            for (const item of items) {
              const productId = item.productId || item.product?.id;
              if (productId) {
                await fetch(`${apiurl}/api/cart/${productId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    };

    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Placed Successfully!
            </h1>
            
            <p className="text-gray-600 mb-8 max-w-md">
              Thank you for your purchase! Your order has been confirmed and you will receive an email confirmation shortly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md mb-8">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">Email Confirmation</p>
                  <p className="text-xs text-blue-700">Sent to your email</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="text-sm font-medium text-green-900">Order Tracking</p>
                  <p className="text-xs text-green-700">Track your package</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link href="/orders">
                  View Order Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/products">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
