"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Search, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useProducts } from "@/components/admin/product-context"

interface Product {
  id: string | number
  name: string
  description?: string
  price: number
  image_url?: string
  brand?: string
  stock_quantity: number
  is_active: boolean
  category: string // Always the category name
}

interface Category {
  id: string
  name: string
}

interface ProductsTabProps {
  products: Product[]
  categories: Category[]
}

export function ProductsTab({ categories }: { categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const { toast } = useToast()
  const { products: contextProducts, updateProduct, deleteProduct } = useProducts()

  // Sort: new products (higher id) at top, old at bottom
  const sortedProducts = [...contextProducts].sort((a, b) => Number(b.id) - Number(a.id))
  // Filter by search and category (category is always the name)
  const filteredProducts = sortedProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      // Update backend
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      })
      if (response.ok) {
        updateProduct(productId, { is_active: !currentStatus })
        toast({
          title: "Product updated",
          description: `Product ${!currentStatus ? "activated" : "deactivated"} successfully.`,
        })
      } else {
        throw new Error("Failed to update product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product status.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        deleteProduct(productId)
        toast({
          title: "Product deleted",
          description: "Product deleted successfully.",
        })
      } else {
        throw new Error("Failed to delete product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditProduct(product)
    setEditModalOpen(true)
  }

  const handleUpdateProduct = async (updated: Partial<Product>) => {
    if (!editProduct) return
    // Remove id from update payload to avoid type conflict
    const { id, ...updatePayload } = updated
    try {
      const response = await fetch(`/api/admin/products/${editProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      })
      if (response.ok) {
        updateProduct(editProduct.id.toString(), updatePayload)
        toast({
          title: "Product updated",
          description: "Product updated successfully.",
        })
        setEditModalOpen(false)
      } else {
        throw new Error("Failed to update product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products Management</CardTitle>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 w-full">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-white shadow-sm"
            >
              <img
                src={product.image_url || "/placeholder.svg?height=80&width=80"}
                alt={product.name}
                className="w-24 h-24 object-cover rounded mb-2 sm:mb-0"
              />
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg break-words">{product.name}</h3>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2 break-words">{product.brand}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-orange-600">${product.price.toFixed(2)}</span>
                  <span>Stock: {product.stock_quantity}</span>
                  <span>Category: {product.category || "Uncategorized"}</span>
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 sm:w-10 sm:h-10"
                  onClick={() => toggleProductStatus(product.id, product.is_active)}
                  aria-label={product.is_active ? "Deactivate" : "Activate"}
                >
                  {product.is_active ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 sm:w-10 sm:h-10"
                  onClick={() => handleEditProduct(product)}
                  aria-label="Edit"
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 sm:w-10 sm:h-10 text-destructive bg-transparent"
                  onClick={() => handleDeleteProduct(product.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {/* Edit Product Modal */}
        {editModalOpen && editProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
              <h2 className="text-lg font-bold mb-4">Edit Product</h2>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const updated: Partial<Product> = {
                    name: formData.get("name") as string,
                    description: formData.get("description") as string,
                    price: Number(formData.get("price")),
                    brand: formData.get("brand") as string,
                    stock_quantity: Number(formData.get("stock_quantity")),
                    image_url: formData.get("image_url") as string,
                  }
                  handleUpdateProduct(updated)
                }}
              >
                <div className="space-y-2">
                  <input name="name" defaultValue={editProduct.name} placeholder="Name" className="w-full border rounded px-2 py-1" />
                  <input name="description" defaultValue={editProduct.description} placeholder="Description" className="w-full border rounded px-2 py-1" />
                  <input name="price" type="number" defaultValue={editProduct.price} placeholder="Price" className="w-full border rounded px-2 py-1" />
                  <input name="brand" defaultValue={editProduct.brand} placeholder="Brand" className="w-full border rounded px-2 py-1" />
                  <input name="stock_quantity" type="number" defaultValue={editProduct.stock_quantity} placeholder="Stock Quantity" className="w-full border rounded px-2 py-1" />
                  <input name="image_url" defaultValue={editProduct.image_url} placeholder="Image URL" className="w-full border rounded px-2 py-1" />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
