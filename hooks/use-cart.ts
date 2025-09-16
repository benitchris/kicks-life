"use client"

import { useState, useEffect } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  image_url?: string
  size: string
  color: string
  quantity: number
}

// Simple localStorage-based cart management
const CART_STORAGE_KEY = "cart-storage"

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function setStoredCart(items: CartItem[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore storage errors
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    setItems(getStoredCart())
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    setStoredCart(items)
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color,
      )

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item,
        )
      } else {
        return [...currentItems, newItem]
      }
    })
  }

  const removeItem = (id: string, size: string, color: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => !(item.id === id && item.size === size && item.color === color)),
    )
  }

  const updateQuantity = (id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size, color)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id && item.size === size && item.color === color ? { ...item, quantity } : item,
      ),
    )
  }

  const clearCart = () => setItems([])

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
  }
}
