import { type NextRequest, NextResponse } from "next/server"
import { createProduct, getAllProducts } from "@/lib/database-queries"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  image_url: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  sizes: z.string(), // JSON string of sizes array
  colors: z.string(), // JSON string of colors array
  stock_quantity: z.number().min(0, "Stock quantity must be non-negative").default(0),
  featured: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()

    const validatedData = productSchema.parse(productData)

    const newProduct = createProduct(validatedData)

    return NextResponse.json(newProduct)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid product data", errors: error.errors }, { status: 400 })
    }

    console.error("[v0] Error in POST /api/admin/products:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const products = getAllProducts()
    return NextResponse.json({ products })
  } catch (error) {
    console.error("[v0] Error in GET /api/admin/products:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
