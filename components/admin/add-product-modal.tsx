"use client"

import React, { useState } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/components/admin/product-context"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
}

interface AddProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
}

export function AddProductModal({ open, onOpenChange, categories }: AddProductModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    brand: "",
    category: "",
    stock_quantity: "",
    image_url: "",
    sizes: "",
    colors: "",
  })
  const { addProduct } = useProducts()
  // --- Fix: Add missing state and ref for image upload ---
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    let imageUrl = formData.image_url
    try {
      if (imageFile) {
        setUploading(true)
        const uploadData = new FormData()
        uploadData.append("file", imageFile)
        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          body: uploadData,
        })
        setUploading(false)
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          imageUrl = url
        } else {
          throw new Error("Image upload failed")
        }
      }
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl,
          category: formData.category, // send name for backend
          price: Number.parseFloat(formData.price),
          stock_quantity: Number.parseInt(formData.stock_quantity),
          sizes: JSON.stringify(formData.sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)),
          colors: JSON.stringify(formData.colors
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)),
        }),
      })
      if (response.ok) {
        addProduct({} as any)
        toast({
          title: "Product added",
          description: "Product has been added successfully.",
        })
        onOpenChange(false)
        setFormData({
          name: "",
          description: "",
          price: "",
          brand: "",
          category: "",
          stock_quantity: "",
          image_url: "",
          sizes: "",
          colors: "",
        })
        setImageFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
      } else {
        throw new Error("Failed to add product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to add product.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Product Image</Label>
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0])
                  } else {
                    setImageFile(null)
                  }
                }}
                disabled={isLoading || uploading}
              />
              {imageFile && (
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-32 h-32 object-cover mt-2 rounded" />
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sizes">Available Sizes (comma-separated)</Label>
              <Input
                id="sizes"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                placeholder="7, 7.5, 8, 8.5, 9, 9.5, 10"
              />
            </div>
            <div>
              <Label htmlFor="colors">Available Colors (comma-separated)</Label>
              <Input
                id="colors"
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                placeholder="Black/White, Red/Black, Blue/White"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
              {isLoading ? "Adding..." : "Add Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
