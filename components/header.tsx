"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { CartSheet } from "@/components/cart-sheet"
import { useState, useEffect, useRef } from "react"
import { AnimatedSearchIcon } from "@/components/animated-search-icon"
import { HeaderProductsProvider, useHeaderProducts, Product } from "@/components/header-products-context"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useRouter, useSearchParams } from "next/navigation"


function HeaderInner() {
  const { items } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const { allProducts, filteredProducts, setFilteredProducts } = useHeaderProducts()
  const inputRef = useRef<HTMLInputElement>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const MAX_RECOMMENDATIONS = 6

  // Sort products by most ordered (total_sold), fallback to id desc
  function sortByMostOrdered(products: Product[]) {
    return [...products].sort((a, b) => {
      const aSold = a.total_sold ?? 0
      const bSold = b.total_sold ?? 0
      if (bSold !== aSold) return bSold - aSold
      return Number(b.id) - Number(a.id)
    })
  }

  // Client-side filter as user types
  useEffect(() => {
    if (!(mobileSearchOpen || showRecommendations)) return
    if (!searchTerm) {
      setFilteredProducts(sortByMostOrdered(allProducts))
      return
    }
    const lower = searchTerm.toLowerCase()
    setFilteredProducts(
      sortByMostOrdered(
        allProducts.filter(p =>
          p.name.toLowerCase().includes(lower) ||
          (p.brand && p.brand.toLowerCase().includes(lower)) ||
          (p.category && p.category.toLowerCase().includes(lower))
        )
      )
    )
  }, [searchTerm, allProducts, setFilteredProducts, mobileSearchOpen, showRecommendations])

  const recommendations = filteredProducts.slice(0, MAX_RECOMMENDATIONS)

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Only do server search on Enter
    const params = new URLSearchParams(Array.from(searchParams.entries()))
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }
    router.push(`/?${params.toString()}`)
    setMobileSearchOpen(false)
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
          {/* Mobile search icon */}
          <button
            type="button"
            className="md:hidden mr-2 flex items-center justify-center"
            aria-label="Open search"
            onClick={() => setMobileSearchOpen((v) => !v)}
          >
            <AnimatedSearchIcon open={mobileSearchOpen} />
          </button>
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
          {/* Desktop search */}
          <div className="hidden md:flex flex-col items-start gap-0 relative">
            <form className="flex items-center gap-2" onSubmit={handleSearch} autoComplete="off">
              <span className="text-muted-foreground">🔍</span>
              <Input
                placeholder="Search sneakers..."
                className="w-64"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value)
                  setShowRecommendations(true)
                }}
                onFocus={() => setShowRecommendations(true)}
                autoComplete="off"
              />
            </form>
            {/* Desktop: recommended items dropdown */}
            {showRecommendations && searchTerm && filteredProducts.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded shadow-lg max-h-64 overflow-y-auto divide-y divide-gray-100 z-50">
                {recommendations.map(product => (
                  <button
                    type="button"
                    key={product.id}
                    className="w-full text-left block px-4 py-2 text-gray-900 hover:bg-orange-50 transition-colors"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      setSearchTerm(product.name)
                      setShowRecommendations(false)
                      // Trigger server search for this product
                      const params = new URLSearchParams(Array.from(searchParams.entries()))
                      params.set("search", product.name)
                      router.push(`/?${params.toString()}`)
                    }}
                  >
                    <span className="font-medium">{product.name}</span>
                    {product.brand && <span className="ml-2 text-xs text-gray-500">{product.brand}</span>}
                  </button>
                ))}
              </div>
            )}
            {showRecommendations && searchTerm && filteredProducts.length === 0 && (
              <div className="absolute left-0 top-full mt-1 w-72 bg-white rounded shadow-lg px-4 py-2 text-gray-400 text-sm z-50">No matches found.</div>
            )}
          </div>

          {/* Mobile search input, animated */}
          <form
            className={`md:hidden absolute left-0 right-0 top-16 z-40 flex flex-col gap-2 px-4 py-2 bg-background/95 transition-all duration-500 ease-out ${mobileSearchOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-4'}`}
            style={{ boxShadow: mobileSearchOpen ? '0 4px 24px 0 rgba(0,0,0,0.10)' : 'none' }}
            onSubmit={handleSearch}
          >
            <Input
              ref={inputRef}
              autoFocus={mobileSearchOpen}
              placeholder="Search sneakers..."
              className="flex-1"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setShowRecommendations(true)}
              onBlur={() => { setMobileSearchOpen(false); setShowRecommendations(false) }}
            />
            {/* Show filtered results only if not submitting */}
            {showRecommendations && searchTerm && filteredProducts.length > 0 && (
              <div className="bg-white rounded shadow-lg mt-2 max-h-64 overflow-y-auto divide-y divide-gray-100">
                {recommendations.map(product => (
                  <button
                    type="button"
                    key={product.id}
                    className="w-full text-left block px-4 py-2 text-gray-900 hover:bg-orange-50 transition-colors"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => {
                      setSearchTerm(product.name)
                      setShowRecommendations(false)
                      // Trigger server search for this product
                      const params = new URLSearchParams(Array.from(searchParams.entries()))
                      params.set("search", product.name)
                      router.push(`/?${params.toString()}`)
                      setMobileSearchOpen(false)
                    }}
                  >
                    <span className="font-medium">{product.name}</span>
                    {product.brand && <span className="ml-2 text-xs text-gray-500">{product.brand}</span>}
                  </button>
                ))}
              </div>
            )}
            {showRecommendations && searchTerm && filteredProducts.length === 0 && (
              <div className="bg-white rounded shadow-lg mt-2 px-4 py-2 text-gray-400 text-sm">No matches found.</div>
            )}
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

export function Header() {
  return (
    <HeaderProductsProvider>
      <HeaderInner />
    </HeaderProductsProvider>
  )
}
