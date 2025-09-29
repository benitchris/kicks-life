// Database query functions for the e-commerce store
import { getDatabase, type Product, type Order, type OrderItem, type PromoCode } from "./database"

const db = getDatabase()

// Product queries
export function getAllProducts(): Product[] {
  const stmt = db.prepare("SELECT * FROM products ORDER BY featured DESC, created_at DESC")
  return stmt.all() as Product[]
}

export function getFeaturedProducts(): Product[] {
  const stmt = db.prepare("SELECT * FROM products WHERE featured = 1 ORDER BY created_at DESC")
  return stmt.all() as Product[]
}

export function getProductById(id: number): Product | null {
  const stmt = db.prepare("SELECT * FROM products WHERE id = ?")
  return stmt.get(id) as Product | null
}

export function getProductsByCategory(category: string): Product[] {
  const stmt = db.prepare("SELECT * FROM products WHERE category = ? ORDER BY created_at DESC")
  return stmt.all(category) as Product[]
}

export function searchProducts(query: string): Product[] {
  const searchTerm = `%${query}%`
  const stmt = db.prepare(`
    SELECT * FROM products 
    WHERE name LIKE ? OR description LIKE ? OR brand LIKE ? OR category LIKE ?
    ORDER BY featured DESC, created_at DESC
  `)
  return stmt.all(searchTerm, searchTerm, searchTerm, searchTerm) as Product[]
}

export function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Product {
  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, image_url, category, brand, sizes, colors, stock_quantity, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    product.name,
    product.description,
    product.price,
    product.image_url,
    product.category,
    product.brand,
    product.sizes,
    product.colors,
    product.stock_quantity,
    product.featured ? 1 : 0,
  )

  return getProductById(result.lastInsertRowid as number)!
}

export function updateProduct(id: number, updates: Partial<Product>): Product | null {
  const fields = Object.keys(updates).filter((key) => key !== "id" && key !== "created_at")
  if (fields.length === 0) return getProductById(id)

  const setClause = fields.map((field) => `${field} = ?`).join(", ")
  const values = fields.map((field) => updates[field as keyof Product])

  const stmt = db.prepare(`
    UPDATE products 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `)

  stmt.run(...values, id)
  return getProductById(id)
}

export function deleteProduct(id: number): boolean {
  const stmt = db.prepare("DELETE FROM products WHERE id = ?")
  const result = stmt.run(id)
  return result.changes > 0
}

// Order queries
export function getAllOrders(): Order[] {
  const stmt = db.prepare("SELECT * FROM orders ORDER BY created_at DESC")
  return stmt.all() as Order[]
}

export function getOrderById(id: number): Order | null {
  const stmt = db.prepare("SELECT * FROM orders WHERE id = ?")
  return stmt.get(id) as Order | null
}

export function getOrderItems(orderId: number): (OrderItem & { product_name: string })[] {
  const stmt = db.prepare(`
    SELECT oi.*, p.name as product_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `)
  return stmt.all(orderId) as (OrderItem & { product_name: string })[]
}

export function createOrder(orderData: {
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  subtotal: number
  discount_amount?: number
  total_amount: number
  promo_code?: string
  items: Array<{
    product_id: number
    quantity: number
    size?: string
    color?: string
    price: number
  }>
}): Order {
  const transaction = db.transaction(() => {
    const orderStmt = db.prepare(`
      INSERT INTO orders (customer_name, customer_email, customer_phone, shipping_address, subtotal, discount_amount, total_amount, promo_code_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    // Get promo code ID if provided
    let promoCodeId = null
    if (orderData.promo_code) {
      const promoCode = getPromoCodeByCode(orderData.promo_code)
      promoCodeId = promoCode?.id || null
    }

    const orderResult = orderStmt.run(
      orderData.customer_name,
      orderData.customer_email,
      orderData.customer_phone || null,
      orderData.shipping_address,
      orderData.subtotal,
      orderData.discount_amount || 0,
      orderData.total_amount,
      promoCodeId,
    )

    const orderId = orderResult.lastInsertRowid as number

    // Create order items
    const itemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, size, color, price)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    orderData.items.forEach((item) => {
      itemStmt.run(orderId, item.product_id, item.quantity, item.size || "", item.color || "", item.price)
    })

    // Update promo code usage if applicable
    if (orderData.promo_code) {
      const promoStmt = db.prepare(`
        UPDATE promo_codes 
        SET current_uses = current_uses + 1 
        WHERE code = ?
      `)
      promoStmt.run(orderData.promo_code)
    }

    return orderId
  })

  const orderId = transaction()
  return getOrderById(orderId)!
}

export function updateOrderStatus(id: number, status: string): Order | null {
  const stmt = db.prepare(`
    UPDATE orders 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `)

  stmt.run(status, id)
  return getOrderById(id)
}

// Promo code queries
export function getAllPromoCodes(): PromoCode[] {
  const stmt = db.prepare("SELECT * FROM promo_codes ORDER BY created_at DESC")
  return stmt.all() as PromoCode[]
}

export function getPromoCodeByCode(code: string): PromoCode | null {
  const stmt = db.prepare("SELECT * FROM promo_codes WHERE code = ?")
  return stmt.get(code) as PromoCode | null
}

export function validatePromoCode(
  code: string,
  orderAmount: number,
): {
  valid: boolean
  message: string
  discount?: number
  promoCode?: PromoCode
} {
  const promoCode = getPromoCodeByCode(code)

  if (!promoCode) {
    return { valid: false, message: "Promo code not found" }
  }

  if (!promoCode.active) {
    return { valid: false, message: "Promo code is inactive" }
  }

  if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
    return { valid: false, message: "Promo code has expired" }
  }

  if (orderAmount < promoCode.min_order_amount) {
    return {
      valid: false,
      message: `Minimum order amount of $${promoCode.min_order_amount} required`,
    }
  }

  if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
    return { valid: false, message: "Promo code usage limit reached" }
  }

  const discount =
    promoCode.discount_type === "percentage" ? (orderAmount * promoCode.discount_value) / 100 : promoCode.discount_value

  return {
    valid: true,
    message: "Promo code applied successfully",
    discount,
    promoCode,
  }
}

export function createPromoCode(promoData: Omit<PromoCode, "id" | "current_uses" | "created_at">): PromoCode {
  const stmt = db.prepare(`
    INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_uses, active, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const result = stmt.run(
    promoData.code,
    promoData.discount_type,
    promoData.discount_value,
    promoData.min_order_amount,
    promoData.max_uses || null,
    promoData.active ? 1 : 0,
    promoData.expires_at || null,
  )

  const promoStmt = db.prepare("SELECT * FROM promo_codes WHERE id = ?")
  return promoStmt.get(result.lastInsertRowid) as PromoCode
}

export function updatePromoCode(id: number, updates: Partial<PromoCode>): PromoCode | null {
  const fields = Object.keys(updates).filter((key) => key !== "id" && key !== "created_at" && key !== "current_uses")
  if (fields.length === 0) {
    const stmt = db.prepare("SELECT * FROM promo_codes WHERE id = ?")
    return stmt.get(id) as PromoCode | null
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ")
  const values = fields.map((field) => updates[field as keyof PromoCode])

  const stmt = db.prepare(`UPDATE promo_codes SET ${setClause} WHERE id = ?`)
  stmt.run(...values, id)

  const selectStmt = db.prepare("SELECT * FROM promo_codes WHERE id = ?")
  return selectStmt.get(id) as PromoCode | null
}

export function deletePromoCode(id: number): boolean {
  const stmt = db.prepare("DELETE FROM promo_codes WHERE id = ?")
  const result = stmt.run(id)
  return result.changes > 0
}

// Analytics queries
export function getOrderStats(): {
  total_orders: number
  total_revenue: number
  pending_orders: number
  completed_orders: number
} {
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total_orders,
      SUM(total_amount) as total_revenue,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
      SUM(CASE WHEN status IN ('delivered', 'shipped') THEN 1 ELSE 0 END) as completed_orders
    FROM orders
  `)

  return stmt.get() as {
    total_orders: number
    total_revenue: number
    pending_orders: number
    completed_orders: number
  }
}

export function getTopProducts(limit = 5): Array<Product & { total_sold: number }> {
  const stmt = db.prepare(`
    SELECT p.*, COALESCE(SUM(oi.quantity), 0) as total_sold
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    WHERE o.status IN ('delivered', 'shipped') OR o.status IS NULL
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT ?
  `)

  return stmt.all(limit) as Array<Product & { total_sold: number }>
}
