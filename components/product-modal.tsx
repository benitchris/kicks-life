"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number
  name: string
  description?: string
  price: number
  image_url?: string
  brand?: string
  category: string
  sizes: string // JSON string from database
  colors: string // JSON string from database
  stock_quantity: number
  featured: boolean
}

interface ProductModalProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const { toast } = useToast()

  const sizesArray = product.sizes ? JSON.parse(product.sizes) : []
  const colorsArray = product.colors ? JSON.parse(product.colors) : []

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: "Please select options",
        description: "Please select both size and color before adding to cart.",
        variant: "destructive",
      })
      return
    }

    addItem({
      id: product.id.toString(), // Convert number to string for cart
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size: selectedSize,
      color: selectedColor,
      quantity,
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square">
            <img
              src={product.image_url || "/placeholder.svg?height=400&width=400"}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.brand}</Badge>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <p className="text-3xl font-bold text-orange-600 mb-2">${product.price.toFixed(2)}</p>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div>
              <Label className="text-base font-semibold">Size</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {sizesArray.map((size: string) => (
                    <SelectItem key={size} value={size}>
                      US {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-semibold">Color</Label>
              <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="mt-2">
                {colorsArray.map((color: string) => (
                  <div key={color} className="flex items-center space-x-2">
                    <RadioGroupItem value={color} id={color} />
                    <Label htmlFor={color}>{color}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold">Quantity</Label>
              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <span>−</span>
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <span>+</span>
                </Button>
              </div>
            </div>

            <Button className="w-full bg-orange-600 hover:bg-orange-700" size="lg" onClick={handleAddToCart}>
              <span className="mr-2">🛒</span>
              Add to Cart - ${(product.price * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
