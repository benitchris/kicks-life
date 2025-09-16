import { type NextRequest, NextResponse } from "next/server"
import { updateOrderStatus, getOrderById } from "@/lib/database-queries"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updateData = await request.json()

    const orderId = Number.parseInt(id)

    if (isNaN(orderId)) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 })
    }

    // Check if order exists
    const existingOrder = getOrderById(orderId)
    if (!existingOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Update order status
    const updatedOrder = updateOrderStatus(orderId, updateData.status)

    if (!updatedOrder) {
      return NextResponse.json({ message: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("[v0] Error in PATCH /api/admin/orders/[id]:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
