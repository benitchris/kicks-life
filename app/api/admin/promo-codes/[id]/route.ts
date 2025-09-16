import { type NextRequest, NextResponse } from "next/server"
import { updatePromoCode, deletePromoCode } from "@/lib/database-queries"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updateData = await request.json()

    const promoCodeId = Number.parseInt(id)

    if (isNaN(promoCodeId)) {
      return NextResponse.json({ message: "Invalid promo code ID" }, { status: 400 })
    }

    // Update promo code
    const updatedPromoCode = updatePromoCode(promoCodeId, updateData)

    if (!updatedPromoCode) {
      return NextResponse.json({ message: "Promo code not found" }, { status: 404 })
    }

    return NextResponse.json(updatedPromoCode)
  } catch (error) {
    console.error("[v0] Error in PATCH /api/admin/promo-codes/[id]:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const promoCodeId = Number.parseInt(id)

    if (isNaN(promoCodeId)) {
      return NextResponse.json({ message: "Invalid promo code ID" }, { status: 400 })
    }

    const success = deletePromoCode(promoCodeId)

    if (!success) {
      return NextResponse.json({ message: "Promo code not found or failed to delete" }, { status: 404 })
    }

    return NextResponse.json({ message: "Promo code deleted successfully" })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/admin/promo-codes/[id]:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
