import { ProductCard } from "@/components/product-card"

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

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found in this category.</p>
      </div>
    )
  }

  // Sort products by id descending (newest first)
  const sortedProducts = [...products].sort((a, b) => Number(b.id) - Number(a.id))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
