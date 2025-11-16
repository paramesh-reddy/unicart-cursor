"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import productsData from "@/data/products.json";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Get products from localStorage or use default
    const storedProducts = localStorage.getItem("unicart_admin_products");
    const products = storedProducts ? JSON.parse(storedProducts) : productsData;

    // Calculate stats
    const lowStock = products.filter((p: any) => p.stockQuantity < p.lowStockThreshold).length;

    setStats({
      totalProducts: products.length,
      lowStockProducts: lowStock,
      totalOrders: 0, // Would come from orders in real app
      totalRevenue: 0, // Would come from orders in real app
    });
  }, []);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
      change: "+5%",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-green-500",
      change: "+12%",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-yellow-500",
      change: "+8%",
    },
    {
      title: "Low Stock Alerts",
      value: stats.lowStockProducts,
      icon: AlertCircle,
      color: "bg-red-500",
      change: "",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                  <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </span>
                )}
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button asChild className="w-full justify-start" size="lg">
              <Link href="/admin/products/new">
                <Package className="mr-2 h-5 w-5" />
                Add New Product
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" size="lg">
              <Link href="/admin/products">
                <Package className="mr-2 h-5 w-5" />
                Manage Products
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start" size="lg">
              <Link href="/admin/orders">
                <ShoppingCart className="mr-2 h-5 w-5" />
                View Orders
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Low Stock Alerts</h2>
          {stats.lowStockProducts > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    {stats.lowStockProducts} products need restocking
                  </p>
                  <Link href="/admin/products" className="text-sm text-red-600 hover:text-red-700">
                    View products →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">All products are well stocked</p>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Admin logged in</p>
                <p className="text-sm text-gray-600">Just now</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">Products loaded</p>
                <p className="text-sm text-gray-600">{stats.totalProducts} products in catalog</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

