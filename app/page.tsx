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

async function getProducts(category?: string) {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const url = new URL("/api/products", baseUrl)
    if (category) {
      url.searchParams.set("category", category)
    }

    const response = await fetch(url.toString(), {
      cache: "no-store", // Always fetch fresh data
    })

    if (!response.ok) {
      console.error("[v0] Failed to fetch products:", response.statusText)
      return []
    }

    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return []
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams

  const products = await getProducts(params.category)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <CategoryFilter categories={categories} />
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
