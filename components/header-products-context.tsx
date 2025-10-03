import { createContext, useContext, useState, useEffect, ReactNode } from "react"


export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  brand?: string;
  category: string;
  sizes: string;
  colors: string;
  stock_quantity: number;
  featured: boolean;
  total_sold?: number; // for recommendations sorting
}

interface HeaderProductsContextType {
  allProducts: Product[]
  filteredProducts: Product[]
  setAllProducts: (products: Product[]) => void
  setFilteredProducts: (products: Product[]) => void
}

const HeaderProductsContext = createContext<HeaderProductsContextType | undefined>(undefined)

export function useHeaderProducts() {
  const ctx = useContext(HeaderProductsContext)
  if (!ctx) throw new Error("useHeaderProducts must be used within HeaderProductsProvider")
  return ctx
}

export function HeaderProductsProvider({ children }: { children: ReactNode }) {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  useEffect(() => {
    // Fetch all products on mount for client-side filtering
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setAllProducts(data.products || [])
        setFilteredProducts(data.products || [])
      })
  }, [])

  return (
    <HeaderProductsContext.Provider value={{ allProducts, filteredProducts, setAllProducts, setFilteredProducts }}>
      {children}
    </HeaderProductsContext.Provider>
  )
}
