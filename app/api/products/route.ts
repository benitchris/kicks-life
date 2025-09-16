// API route for getting all products
import { type NextRequest, NextResponse } from "next/server"
import { getAllProducts, getFeaturedProducts, searchProducts, getProductsByCategory } from "@/lib/database-queries"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")

    let products

    if (search) {
      products = searchProducts(search)
    } else if (category) {
      products = getProductsByCategory(category)
    } else if (featured === "true") {
      products = getFeaturedProducts()
    } else {
      products = getAllProducts()
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
