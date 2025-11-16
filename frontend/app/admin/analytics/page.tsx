"use client";

import { Card } from "@/components/ui/Card";
import { BarChart3 } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-600">View sales reports and insights</p>
      </div>

      <Card className="p-12 text-center">
        <div className="flex flex-col items-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <BarChart3 className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600">
            Advanced analytics and reporting features coming soon.
          </p>
        </div>
      </Card>
    </div>
  );
}

