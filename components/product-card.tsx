"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { ProductModal } from "@/components/product-modal"

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

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sizesArray = product.sizes ? JSON.parse(product.sizes) : []
  const colorsArray = product.colors ? JSON.parse(product.colors) : []

  return (
    <>
      <Card className="group cursor-pointer hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div className="aspect-square relative overflow-hidden rounded-t-lg">
            <img
              src={product.image_url || "/placeholder.svg?height=300&width=300"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onClick={() => setIsModalOpen(true)}
            />
            <Button size="icon" variant="ghost" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
              <span className="text-lg">♥</span>
            </Button>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs">
                {product.brand}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600">${product.price.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">{sizesArray.length} sizes</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => setIsModalOpen(true)}>
            <span className="mr-2">🛒</span>
            Add to Cart
          </Button>
        </CardFooter>
      </Card>

      <ProductModal product={product} open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
