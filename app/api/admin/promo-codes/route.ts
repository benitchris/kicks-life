import { type NextRequest, NextResponse } from "next/server"
import { createPromoCode, getAllPromoCodes } from "@/lib/database-queries"
import { z } from "zod"

const promoCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Promo code is required")
    .transform((val) => val.toUpperCase()),
  discount_type: z.enum(["percentage", "fixed"], { required_error: "Discount type must be percentage or fixed" }),
  discount_value: z.number().min(0, "Discount value must be non-negative"),
  min_order_amount: z.number().min(0, "Minimum order amount must be non-negative").default(0),
  max_uses: z.number().min(1).optional(),
  active: z.boolean().default(true),
  expires_at: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const promoData = await request.json()

    const validatedData = promoCodeSchema.parse(promoData)

    const newPromoCode = createPromoCode(validatedData)

    return NextResponse.json(newPromoCode)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid promo code data", errors: error.errors }, { status: 400 })
    }

    console.error("[v0] Error in POST /api/admin/promo-codes:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const promoCodes = getAllPromoCodes()
    return NextResponse.json({ promoCodes })
  } catch (error) {
    console.error("[v0] Error in GET /api/admin/promo-codes:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
