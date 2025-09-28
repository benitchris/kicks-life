"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

export interface PromoCode {
  id: string
  code: string
  discount_type: string
  discount_value: number
  min_order_amount: number
  max_uses?: number
  current_uses: number
  is_active: boolean
  expires_at?: string
}

interface PromoCodeContextType {
  promoCodes: PromoCode[]
  setPromoCodes: (promoCodes: PromoCode[]) => void
  addPromoCode: (promoCode: PromoCode) => void
  updatePromoCode: (id: string, updates: Partial<PromoCode>) => void
  deletePromoCode: (id: string) => void
}

const PromoCodeContext = createContext<PromoCodeContextType | undefined>(undefined)

export function PromoCodeProvider({ children, initialPromoCodes = [] }: { children: ReactNode, initialPromoCodes?: PromoCode[] }) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes)

  const addPromoCode = useCallback((promoCode: PromoCode) => {
    setPromoCodes((prev) => [promoCode, ...prev])
  }, [])

  const updatePromoCode = useCallback((id: string, updates: Partial<PromoCode>) => {
    setPromoCodes((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }, [])

  const deletePromoCode = useCallback((id: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return (
    <PromoCodeContext.Provider value={{ promoCodes, setPromoCodes, addPromoCode, updatePromoCode, deletePromoCode }}>
      {children}
    </PromoCodeContext.Provider>
  )
}

export function usePromoCodes() {
  const ctx = useContext(PromoCodeContext)
  if (!ctx) throw new Error("usePromoCodes must be used within a PromoCodeProvider")
  return ctx
}
