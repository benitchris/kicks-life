import { PromoCode } from "@/components/admin/promo-code-context"

export interface DiscountResult {
  valid: boolean
  message: string
  discount: number
  code?: string
}

export function validateAndApplyPromoCode({
  code,
  subtotal,
  promoCodes,
}: {
  code: string
  subtotal: number
  promoCodes: PromoCode[]
}): DiscountResult {
  const promo = promoCodes.find(
    (p) => p.code.toUpperCase() === code.trim().toUpperCase() && p.is_active
  )
  if (!promo) {
    return { valid: false, message: "Promo code not found or inactive", discount: 0 }
  }
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { valid: false, message: "Promo code has expired", discount: 0 }
  }
  if (promo.max_uses && promo.current_uses >= promo.max_uses) {
    return { valid: false, message: "Promo code usage limit reached", discount: 0 }
  }
  if (subtotal < promo.min_order_amount) {
    return {
      valid: false,
      message: `Minimum order amount of $${promo.min_order_amount} required`,
      discount: 0,
    }
  }
  let discount = 0
  if (promo.discount_type === "percentage") {
    discount = (subtotal * promo.discount_value) / 100
  } else {
    discount = promo.discount_value
  }
  return {
    valid: true,
    message: "Promo code applied successfully!",
    discount,
    code: promo.code,
  }
}
