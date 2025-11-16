"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { slugify } from "@/lib/utils";
import type { Product } from "@/types";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
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

  // Load product data
  useEffect(() => {
    const storedProducts = localStorage.getItem("unicart_admin_products");
    if (storedProducts) {
      const products = JSON.parse(storedProducts);
      const foundProduct = products.find((p: Product) => p.id === productId);
      
      if (foundProduct) {
        setProduct(foundProduct);
        setFormData({
          name: foundProduct.name,
          description: foundProduct.description,
          shortDescription: foundProduct.shortDescription || "",
          categoryId: foundProduct.categoryId,
          brand: foundProduct.brand || "",
          sku: foundProduct.sku || "",
          price: foundProduct.price.toString(),
          comparePrice: foundProduct.comparePrice?.toString() || "",
          stockQuantity: foundProduct.stockQuantity.toString(),
          lowStockThreshold: foundProduct.lowStockThreshold.toString(),
          imageUrl: foundProduct.images[0]?.url || "",
          isFeatured: foundProduct.isFeatured,
          isActive: foundProduct.isActive,
        });
        setImageUrl(foundProduct.images[0]?.url || "");
      } else {
        router.push("/admin/products");
      }
    }
  }, [productId, router]);

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

      // Update product
      const updatedProducts = products.map((p: Product) => {
        if (p.id === productId) {
          return {
            ...p,
            name: formData.name,
            slug: slugify(formData.name),
            description: formData.description,
            shortDescription: formData.shortDescription || formData.description.substring(0, 100),
            categoryId: formData.categoryId,
            brand: formData.brand || undefined,
            sku: formData.sku || p.sku,
            price: parseFloat(formData.price),
            comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
            stockQuantity: parseInt(formData.stockQuantity),
            lowStockThreshold: parseInt(formData.lowStockThreshold),
            isActive: formData.isActive,
            isFeatured: formData.isFeatured,
            images: [
              {
                id: p.images[0]?.id || `img-${Date.now()}`,
                url: formData.imageUrl,
                alt: formData.name,
                isPrimary: true,
                displayOrder: 0,
              },
            ],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      // Save to localStorage
      localStorage.setItem("unicart_admin_products", JSON.stringify(updatedProducts));
      localStorage.setItem("unicart_products", JSON.stringify(updatedProducts));

      // Redirect to products list
      router.push("/admin/products");
    } catch (err) {
      setError("Failed to update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      const storedProducts = localStorage.getItem("unicart_admin_products");
      if (storedProducts) {
        const products = JSON.parse(storedProducts);
        const updatedProducts = products.filter((p: Product) => p.id !== productId);
        
        localStorage.setItem("unicart_admin_products", JSON.stringify(updatedProducts));
        localStorage.setItem("unicart_products", JSON.stringify(updatedProducts));
        
        router.push("/admin/products");
      }
    }
  };

  if (!product) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
            <p className="text-gray-600">Update product information</p>
          </div>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Product
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Same as New Product */}
          <div className="lg:col-span-2 space-y-6">
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
                    value={formData.description}
                    onChange={handleChange}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      value={formData.brand}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </Card>

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
                      value={formData.comparePrice}
                      onChange={handleChange}
                    />
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
                      value={formData.lowStockThreshold}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Product Image</h2>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    handleChange(e);
                    setImageUrl(e.target.value);
                  }}
                  required
                />

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

          {/* Sidebar */}
          <div className="space-y-6">
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
                      Show on homepage
                    </p>
                  </div>
                </label>
              </div>
            </Card>

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
                  {isLoading ? "Updating..." : "Update Product"}
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
          </div>
        </div>
      </form>
    </div>
  );
}

