"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  brand?: string
  stock_quantity: number
  is_active: boolean
  category: string // Always the category name
  sizes?: string
  colors?: string
  featured?: boolean
}

interface ProductContextType {
  products: Product[]
  setProducts: (products: Product[]) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children, initialProducts = [] }: { children: ReactNode, initialProducts?: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)

  // Helper to fetch all products from backend and update state
  const fetchAndSetProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.products)) {
          setProducts(data.products)
        }
      }
    } catch (e) {
      // Optionally handle error
    }
  }, [])

  // Always fetch products on mount for initial sync
  React.useEffect(() => {
    fetchAndSetProducts()
  }, [fetchAndSetProducts])

  const addProduct = useCallback((product: Product) => {
    fetchAndSetProducts()
  }, [fetchAndSetProducts])

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    fetchAndSetProducts()
  }, [fetchAndSetProducts])

  const deleteProduct = useCallback((id: string) => {
    fetchAndSetProducts()
  }, [fetchAndSetProducts])

  return (
    <ProductContext.Provider value={{ products, setProducts, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error("useProducts must be used within a ProductProvider")
  return ctx
}
