"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  total_amount: string | number
  status: string
  created_at: string
}

interface OrderContextType {
  orders: Order[]
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  deleteOrder: (id: string) => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children, initialOrders = [] }: { children: ReactNode, initialOrders?: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev])
  }, [])

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
  }, [])

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }, [])

  return (
    <OrderContext.Provider value={{ orders, setOrders, addOrder, updateOrder, deleteOrder }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error("useOrders must be used within an OrderProvider")
  return ctx
}
