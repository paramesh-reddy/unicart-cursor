"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="max-w-md">
        <h1 className="text-6xl font-bold text-error mb-4">Oops!</h1>
        <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-8">
          We apologize for the inconvenience. An error occurred while processing
          your request.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Try Again</span>
          </Button>
          <Button variant="outline" asChild>
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              <span>Go Home</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

