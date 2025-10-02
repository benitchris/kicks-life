"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { CartSheet } from "@/components/cart-sheet"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"


export function Header() {
  const { items } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-orange-600">Kicks Life 250</h1>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-sm font-medium hover:text-orange-600 transition-colors">
              Home
            </a>
            <a href="#" className="text-sm font-medium hover:text-orange-600 transition-colors">
              New Arrivals
            </a>
            <a href="#" className="text-sm font-medium hover:text-orange-600 transition-colors">
              Brands
            </a>
            <a href="#" className="text-sm font-medium hover:text-orange-600 transition-colors">
              Sale
            </a>
            <a href="/admin" className="text-sm font-medium hover:text-orange-600 transition-colors">
              Admin
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form className="hidden md:flex items-center gap-2" onSubmit={handleSearch}>
            <span className="text-muted-foreground">🔍</span>
            <Input
              placeholder="Search sneakers..."
              className="w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </form>

          <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
            <span className="text-lg">🛒</span>
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-orange-600">
                {itemCount}
              </Badge>
            )}
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <span className="text-lg">☰</span>
          </Button>
        </div>
      </div>

      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </header>
  )
}
