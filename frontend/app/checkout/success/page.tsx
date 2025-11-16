"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Mail, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    // Generate a random order number
    const orderNum = `UNI-${Date.now().toString().slice(-8)}`;
    setOrderNumber(orderNum);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {/* Order Details */}
        <Card className="p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold">Order Details</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span className="font-medium">
                {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </Card>

        {/* What's Next */}
        <Card className="p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">What's Next?</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Order Confirmation</p>
                <p className="text-sm text-gray-600">
                  You'll receive an email confirmation shortly with your order details.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Processing</p>
                <p className="text-sm text-gray-600">
                  We're preparing your order for shipment. You'll get a tracking number once it ships.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <ArrowRight className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">Delivery</p>
                <p className="text-sm text-gray-600">
                  Your order will arrive within 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/account/orders">
              <Package className="mr-2 h-4 w-4" />
              View Order History
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Need help? Contact our{" "}
            <Link href="/help" className="text-primary-600 hover:text-primary-700">
              customer support
            </Link>{" "}
            team.
          </p>
        </div>
      </div>
    </div>
  );
}
