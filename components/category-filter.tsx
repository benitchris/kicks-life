"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

interface Category {
  id: string
  name: string
  description?: string
}

interface CategoryFilterProps {
  categories: Category[]
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category")

  const handleCategoryChange = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (categoryId) {
      params.set("category", categoryId)
    } else {
      params.delete("category")
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!currentCategory ? "default" : "outline"}
          onClick={() => handleCategoryChange(null)}
          className={!currentCategory ? "bg-orange-600 hover:bg-orange-700" : ""}
        >
          All Products
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={currentCategory === category.id ? "default" : "outline"}
            onClick={() => handleCategoryChange(category.id)}
            className={currentCategory === category.id ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
