import { type NextRequest, NextResponse } from "next/server"
import { getAllOrders, getOrderItems, getOrderStats } from "@/lib/database-queries"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get("stats") === "true"

    if (includeStats) {
      const stats = getOrderStats()
      return NextResponse.json({ stats })
    }

    const orders = getAllOrders()

    // Get order items for each order
    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: getOrderItems(order.id),
    }))

    return NextResponse.json({ orders: ordersWithItems })
  } catch (error) {
    console.error("[v0] Error in GET /api/admin/orders:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
