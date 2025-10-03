// API route for getting all products
import { type NextRequest, NextResponse } from "next/server"
import { getAllProducts, getFeaturedProducts, searchProducts, getProductsByCategory } from "@/lib/database-queries"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const pageSize = parseInt(searchParams.get("pageSize") || "12", 10)

    let products: any[] = []
    if (search) {
      products = searchProducts(search)
    } else if (category) {
      products = getProductsByCategory(category)
    } else if (featured === "true") {
      products = getFeaturedProducts()
    } else {
      products = getAllProducts()
    }

    const total = products.length
    const paginated = products.slice((page - 1) * pageSize, page * pageSize)

    return NextResponse.json({ products: paginated, total })
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
