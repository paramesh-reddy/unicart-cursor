import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-9xl font-bold text-primary-500 mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Sorry, the page you're looking for doesn't exist. It might have been
        moved or deleted.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            <span>Go Home</span>
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">
            <Search className="mr-2 h-4 w-4" />
            <span>Browse Products</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

