// API route for creating orders
import { type NextRequest, NextResponse } from "next/server"
import { createOrder, validatePromoCode } from "@/lib/database-queries"
import { z } from "zod"

const orderSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: z.string().email("Valid email is required"),
  customer_phone: z.string().optional(),
  shipping_address: z.string().min(1, "Shipping address is required"),
  promo_code: z.string().optional(),
  items: z
    .array(
      z.object({
        product_id: z.number(),
        quantity: z.number().min(1),
        size: z.string().optional(),
        color: z.string().optional(),
        price: z.number().min(0),
      }),
    )
    .min(1, "At least one item is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = orderSchema.parse(body)

    // Calculate subtotal
    const subtotal = validatedData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    let discount_amount = 0
    let total_amount = subtotal

    // Validate promo code if provided
    if (validatedData.promo_code) {
      const promoValidation = validatePromoCode(validatedData.promo_code, subtotal)

      if (!promoValidation.valid) {
        return NextResponse.json({ error: promoValidation.message }, { status: 400 })
      }

      discount_amount = promoValidation.discount || 0
      total_amount = subtotal - discount_amount
    }

    // Create the order
    const order = createOrder({
      customer_name: validatedData.customer_name,
      customer_email: validatedData.customer_email,
      customer_phone: validatedData.customer_phone,
      shipping_address: validatedData.shipping_address,
      total_amount,
      promo_code: validatedData.promo_code,
      discount_amount,
      items: validatedData.items,
    })

    // In a real app, you might want to send confirmation email here
    console.log("[v0] Order created successfully:", order.id)

    return NextResponse.json({
      success: true,
      order,
      message: "Order placed successfully!",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid order data", details: error.errors }, { status: 400 })
    }

    console.error("[v0] Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
