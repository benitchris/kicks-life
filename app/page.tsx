import { ProductGrid } from "@/components/product-grid"
import { HeroSection } from "@/components/hero-section"
import { CategoryFilter } from "@/components/category-filter"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const categories = [
  { id: "Basketball", name: "Basketball", slug: "basketball" },
  { id: "Running", name: "Running", slug: "running" },
  { id: "Lifestyle", name: "Lifestyle", slug: "lifestyle" },
]

async function getProducts(category?: string, search?: string, page = 1, pageSize = 12) {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const url = new URL("/api/products", baseUrl)
    if (category) {
      url.searchParams.set("category", category)
    }
    if (search) {
      url.searchParams.set("search", search)
    }
    url.searchParams.set("page", String(page))
    url.searchParams.set("pageSize", String(pageSize))

    const response = await fetch(url.toString(), {
      cache: "no-store", // Always fetch fresh data
    })

    if (!response.ok) {
      console.error("[v0] Failed to fetch products:", response.statusText)
      return { products: [], total: 0 }
    }

    const data = await response.json()
    return { products: data.products || [], total: data.total || 0 }
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return { products: [], total: 0 }
  }
}

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page, 10) : 1
  const pageSize = 12
  const { products, total } = await getProducts(params.category, params.search, page, pageSize)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <CategoryFilter categories={categories} />
          <ProductGrid products={products} />
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <a
                href={`?${new URLSearchParams({ ...params, page: String(Math.max(page - 1, 1)) }).toString()}`}
                className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-200 text-gray-400 pointer-events-none' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                aria-disabled={page === 1}
              >
                Prev
              </a>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <a
                href={`?${new URLSearchParams({ ...params, page: String(Math.min(page + 1, totalPages)) }).toString()}`}
                className={`px-3 py-1 rounded ${page === totalPages ? 'bg-gray-200 text-gray-400 pointer-events-none' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                aria-disabled={page === totalPages}
              >
                Next
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
