"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function TestAdminPage() {
  const { isAuthenticated, user, login, logout, checkAuth } = useAuthStore();
  const [loginData, setLoginData] = useState({
    email: "admin@example.com",
    password: "Admin@123"
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkAuth();
  }, [checkAuth]);

  const handleLogin = async () => {
    const result = await login(loginData.email, loginData.password);
    if (result.success) {
      alert("Login successful!");
    } else {
      alert("Login failed: " + result.message);
    }
  };

  const handleLogout = () => {
    logout();
    alert("Logged out!");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Authentication Test</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Current Auth State</h2>
        <div className="space-y-2">
          <p><strong>Authenticated:</strong> {isAuthenticated ? "✅ Yes" : "❌ No"}</p>
          <p><strong>User Email:</strong> {user?.email || "None"}</p>
          <p><strong>User Role:</strong> {user?.role || "None"}</p>
          <p><strong>User Name:</strong> {user?.firstName ? `${user.firstName} ${user.lastName}` : "None"}</p>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Test Login</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email:</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password:</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          <Button onClick={handleLogin} className="w-full">
            Test Login
          </Button>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Actions</h2>
        <div className="space-y-2">
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Logout
          </Button>
          <Button 
            onClick={() => window.location.href = "/admin"} 
            className="w-full"
            disabled={!isAuthenticated || user?.role !== "admin"}
          >
            Go to Admin Dashboard
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Debug Info</h2>
        <div className="text-sm space-y-1">
          <p><strong>localStorage unicart_auth:</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {isMounted ? (localStorage.getItem("unicart_auth") || "null") : "Loading..."}
          </pre>
          <p><strong>localStorage unicart_current_user:</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {isMounted ? (localStorage.getItem("unicart_current_user") || "null") : "Loading..."}
          </pre>
          <p><strong>localStorage unicart_users:</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {isMounted ? (localStorage.getItem("unicart_users") || "null") : "Loading..."}
          </pre>
        </div>
      </Card>
    </div>
  );
}
