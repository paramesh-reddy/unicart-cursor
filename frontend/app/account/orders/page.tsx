"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, ArrowLeft, Eye, Truck, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types";
import { apiurl } from "@/store/constants";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "processing":
    case "confirmed":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
    case "refunded":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return <CheckCircle className="w-4 h-4" />;
    case "shipped":
      return <Truck className="w-4 h-4" />;
    case "processing":
    case "confirmed":
      return <Clock className="w-4 h-4" />;
    case "cancelled":
    case "refunded":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      await checkAuth();
      const { isAuthenticated: authState } = useAuthStore.getState();
      if (!authState) {
        router.push("/login");
        return;
      }
      fetchOrders();
    };

    checkAccess();
  }, [checkAuth, router]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${apiurl}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your orders</p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

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
            <Link href="/account" className="hover:text-primary-500">
              Account
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Orders</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Account
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Orders</h1>
              <p className="text-gray-600">
                View and track your order history
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchOrders}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package className="w-12 h-12 text-gray-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Loading orders...</h2>
              <p className="text-gray-600">Please wait while we fetch your orders</p>
            </div>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <Button asChild>
                <Link href="/products">
                  Start Shopping
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-6 border-b">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-sm text-gray-600 mt-1">
                        Tracking: <span className="font-medium">{order.trackingNumber}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&auto=format";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {item.productName}
                        </h4>
                        {item.variantName && (
                          <p className="text-sm text-gray-600 mb-1">
                            Variant: {item.variantName}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pt-6 border-t">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                    {order.shippingAddress && (
                      <div className="text-sm text-gray-600">
                        <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p>{order.shippingAddress.address}</p>
                        {order.shippingAddress.apartment && (
                          <p>{order.shippingAddress.apartment}</p>
                        )}
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                          {order.shippingAddress.pincode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping:</span>
                        <span>
                          {order.shippingAmount === 0 ? (
                            <span className="text-green-600 font-medium">FREE</span>
                          ) : (
                            formatPrice(order.shippingAmount)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax:</span>
                        <span>{formatPrice(order.taxAmount)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{formatPrice(order.discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap gap-3 pt-6 border-t">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/account/orders/${order.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm">
                      Write Review
                    </Button>
                  )}
                  {order.status === "shipped" && order.trackingNumber && (
                    <Button variant="outline" size="sm">
                      Track Package
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

