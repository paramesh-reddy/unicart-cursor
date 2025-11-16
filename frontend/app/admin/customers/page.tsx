"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const usersData = localStorage.getItem("unicart_users");
    if (usersData) {
      const users = JSON.parse(usersData);
      setCustomers(users);
    }
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customers</h1>
        <p className="text-gray-600">Manage registered customers</p>
      </div>

      {customers.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Customers Yet</h2>
            <p className="text-gray-600">
              Customer accounts will appear here once users register.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">{customer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={customer.role === "admin" ? "primary" : "secondary"}>
                        {customer.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

