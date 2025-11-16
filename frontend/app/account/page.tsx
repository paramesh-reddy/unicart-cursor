"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Package, Heart, MapPin, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/store/authStore";

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, checkAuth, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your account</p>
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
            <span className="text-gray-900 font-medium">My Account</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-gray-600">
            Welcome back, {user.firstName || user.email.split('@')[0]}!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Overview */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-2">Account Information</h2>
                  <p className="text-gray-600">Manage your personal information</p>
                </div>
                {user.role === "admin" && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
                    Admin
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Account Type</label>
                  <p className="mt-1 text-gray-900 capitalize">{user.role}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button variant="outline"><span>Edit Profile</span></Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/account/orders">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">My Orders</h3>
                      <p className="text-sm text-gray-600">View order history</p>
                    </div>
                  </div>
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/wishlist">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Wishlist</h3>
                      <p className="text-sm text-gray-600">Saved items</p>
                    </div>
                  </div>
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/account/addresses">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Addresses</h3>
                      <p className="text-sm text-gray-600">Manage addresses</p>
                    </div>
                  </div>
                </Link>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/account/security">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Lock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Security</h3>
                      <p className="text-sm text-gray-600">Password settings</p>
                    </div>
                  </div>
                </Link>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <nav className="space-y-2">
                <Link
                  href="/account"
                  className="flex items-center justify-between p-2 rounded-md bg-primary-50 text-primary-700"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dashboard
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/account/orders"
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
                >
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Orders
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/account/addresses"
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Addresses
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </nav>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 mt-4">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">Account Created</p>
                  <p className="text-gray-500">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
