"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { CartSheet } from "@/components/cart-sheet"
import { useState } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useRouter, useSearchParams } from "next/navigation"


export function Header() {
  const { items } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
        {/* Mobile: Menu button left, logo center, cart right */}
        <div className="flex flex-1 items-center gap-2 md:gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            aria-label="Open menu"
            onClick={() => setIsMenuOpen(true)}
          >
            <span className="text-lg">☰</span>
          </Button>
          <h1 className="text-2xl font-bold text-orange-600 mx-auto md:mx-0">Kicks Life 250</h1>
          <nav className="hidden md:flex items-center gap-6 ml-6">
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

          <Button variant="ghost" size="icon" className="relative ml-2" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
            <span className="text-lg">🛒</span>
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-orange-600">
                {itemCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu drawer using Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
  <SheetContent side="left" className="bg-gray-800/90 text-white p-6 w-64">
          {/* The SheetContent already provides a close button in the top right, so we remove this one */}
          <span className="text-2xl font-bold text-orange-600 mb-4 block">Kicks Life 250</span>
          <a href="/" className="text-lg font-medium hover:text-orange-600 transition-colors block mb-2" onClick={() => setIsMenuOpen(false)}>
            Home
          </a>
          <a href="#" className="text-lg font-medium hover:text-orange-600 transition-colors block mb-2" onClick={() => setIsMenuOpen(false)}>
            New Arrivals
          </a>
          <a href="#" className="text-lg font-medium hover:text-orange-600 transition-colors block mb-2" onClick={() => setIsMenuOpen(false)}>
            Brands
          </a>
          <a href="#" className="text-lg font-medium hover:text-orange-600 transition-colors block mb-2" onClick={() => setIsMenuOpen(false)}>
            Sale
          </a>
          <a href="/admin" className="text-lg font-medium hover:text-orange-600 transition-colors block" onClick={() => setIsMenuOpen(false)}>
            Admin
          </a>
        </SheetContent>
      </Sheet>

      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </header>
  )
}
