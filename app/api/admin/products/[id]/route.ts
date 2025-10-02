import { type NextRequest, NextResponse } from "next/server"
import { updateProduct, getProductById, deleteProduct } from "@/lib/database-queries"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updateData = await request.json()

    const productId = Number.parseInt(id)

    if (isNaN(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    // Check if product exists
    const existingProduct = getProductById(productId)
    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    // Update product
    const updatedProduct = updateProduct(productId, updateData)

    if (!updatedProduct) {
      return NextResponse.json({ message: "Failed to update product" }, { status: 500 })
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("[v0] Error in PATCH /api/admin/products/[id]:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const productId = Number.parseInt(id)

    console.log(`[DELETE] Attempting to delete product with id:`, id, 'parsed:', productId)

    if (isNaN(productId)) {
      console.warn(`[DELETE] Invalid product ID:`, id)
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 })
    }

    const success = deleteProduct(productId)
    console.log(`[DELETE] deleteProduct result:`, success)

    if (!success) {
      console.warn(`[DELETE] Product not found or failed to delete:`, productId)
      return NextResponse.json({ message: "Product not found or failed to delete" }, { status: 404 })
    }

    console.log(`[DELETE] Product deleted successfully:`, productId)
    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/admin/products/[id]:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
