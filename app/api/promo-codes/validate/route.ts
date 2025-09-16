import { type NextRequest, NextResponse } from "next/server"
import { validatePromoCode } from "@/lib/database-queries"

export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount } = await request.json()

    if (!code || !orderAmount) {
      return NextResponse.json({ valid: false, message: "Code and order amount are required" }, { status: 400 })
    }

    const validation = validatePromoCode(code.toUpperCase(), orderAmount)

    if (!validation.valid) {
      return NextResponse.json({
        valid: false,
        message: validation.message,
      })
    }

    return NextResponse.json({
      valid: true,
      discountAmount: validation.discount,
      promoCodeId: validation.promoCode?.id,
    })
  } catch (error) {
    console.error("[v0] Error validating promo code:", error)
    return NextResponse.json({ valid: false, message: "Internal server error" }, { status: 500 })
  }
}
