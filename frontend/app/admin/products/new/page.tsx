"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { slugify } from "@/lib/utils";
import type { Product } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    categoryId: "1",
    brand: "",
    sku: "",
    price: "",
    comparePrice: "",
    stockQuantity: "",
    lowStockThreshold: "10",
    imageUrl: "",
    isFeatured: false,
    isActive: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Product name is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Valid price is required");
      return false;
    }
    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
      setError("Valid stock quantity is required");
      return false;
    }
    if (!formData.imageUrl.trim()) {
      setError("Product image URL is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Get existing products
      const storedProducts = localStorage.getItem("unicart_admin_products");
      const products = storedProducts ? JSON.parse(storedProducts) : [];

      // Create new product
      const newProduct: Product = {
        id: `product-${Date.now()}`,
        name: formData.name,
        slug: slugify(formData.name),
        description: formData.description,
        shortDescription: formData.shortDescription || formData.description.substring(0, 100),
        categoryId: formData.categoryId,
        brand: formData.brand || undefined,
        sku: formData.sku || `SKU-${Date.now()}`,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        stockQuantity: parseInt(formData.stockQuantity),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        images: [
          {
            id: `img-${Date.now()}`,
            url: formData.imageUrl,
            alt: formData.name,
            isPrimary: true,
            displayOrder: 0,
          },
        ],
        rating: {
          average: 0,
          count: 0,
        },
        badges: formData.isFeatured ? ["Featured"] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to products array
      products.push(newProduct);

      // Save to localStorage
      localStorage.setItem("unicart_admin_products", JSON.stringify(products));
      localStorage.setItem("unicart_products", JSON.stringify(products));

      // Redirect to products list
      router.push("/admin/products");
    } catch (err) {
      setError("Failed to create product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold mb-2">Add New Product</h1>
        <p className="text-gray-600">Create a new product in your catalog</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g., Wireless Headphones Pro"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <Input
                    id="shortDescription"
                    name="shortDescription"
                    type="text"
                    placeholder="Brief product description"
                    value={formData.shortDescription}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    placeholder="Detailed product description"
                    value={formData.description}
                    onChange={handleChange}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="1">Electronics</option>
                      <option value="2">Fashion</option>
                      <option value="3">Home & Kitchen</option>
                      <option value="4">Beauty</option>
                      <option value="5">Sports</option>
                      <option value="6">Books</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <Input
                      id="brand"
                      name="brand"
                      type="text"
                      placeholder="e.g., AudioTech"
                      value={formData.brand}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <Input
                    id="sku"
                    name="sku"
                    type="text"
                    placeholder="Auto-generated if left empty"
                    value={formData.sku}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </Card>

            {/* Pricing & Inventory */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Pricing & Inventory</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Price * ($)
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="comparePrice" className="block text-sm font-medium text-gray-700 mb-2">
                      Compare Price ($)
                    </label>
                    <Input
                      id="comparePrice"
                      name="comparePrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.comparePrice}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Original price (for showing discounts)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <Input
                      id="stockQuantity"
                      name="stockQuantity"
                      type="number"
                      placeholder="0"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Threshold
                    </label>
                    <Input
                      id="lowStockThreshold"
                      name="lowStockThreshold"
                      type="number"
                      placeholder="10"
                      value={formData.lowStockThreshold}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Alert when stock falls below this number
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Product Image</h2>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => {
                      handleChange(e);
                      setImageUrl(e.target.value);
                    }}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter a URL from Unsplash or any image hosting service
                </p>

                {/* Image Preview */}
                {imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 border">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setImageUrl("")}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Visibility */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Visibility</h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium">Active</p>
                    <p className="text-sm text-gray-600">
                      Product visible to customers
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium">Featured Product</p>
                    <p className="text-sm text-gray-600">
                      Show on homepage and featured sections
                    </p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Action Buttons */}
            <Card className="p-6">
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                  onClick={handleSubmit}
                >
                  <Save className="mr-2 h-5 w-5" />
                  {isLoading ? "Creating..." : "Create Product"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/admin/products">Cancel</Link>
                </Button>
              </div>
            </Card>

            {/* Help Text */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold mb-2 text-blue-900">Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use high-quality images (800x800px min)</li>
                <li>• Write clear, detailed descriptions</li>
                <li>• Set accurate stock quantities</li>
                <li>• Use compare price to show discounts</li>
              </ul>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

