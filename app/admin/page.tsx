import { AdminDashboard } from "@/components/admin/admin-dashboard"

async function getAdminData() {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    // Fetch all admin data in parallel
    const [productsRes, ordersRes, promoCodesRes, statsRes] = await Promise.all([
      fetch(`${baseUrl}/api/admin/products`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/admin/orders`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/admin/promo-codes`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/admin/orders?stats=true`, { cache: "no-store" }),
    ])

    const [productsData, ordersData, promoCodesData, statsData] = await Promise.all([
      productsRes.ok ? productsRes.json() : { products: [] },
      ordersRes.ok ? ordersRes.json() : { orders: [] },
      promoCodesRes.ok ? promoCodesRes.json() : { promoCodes: [] },
      statsRes.ok ? statsRes.json() : { stats: {} },
    ])

    return {
      products: productsData.products || [],
      orders: ordersData.orders || [],
      promoCodes: promoCodesData.promoCodes || [],
      stats: statsData.stats || {},
    }
  } catch (error) {
    console.error("[v0] Error fetching admin data:", error)
    return {
      products: [],
      orders: [],
      promoCodes: [],
      stats: {},
    }
  }
}

export default async function AdminPage() {
  const { products, orders, promoCodes, stats } = await getAdminData()

  const categories = [
    { id: 1, name: "Basketball", created_at: new Date().toISOString() },
    { id: 2, name: "Running", created_at: new Date().toISOString() },
    { id: 3, name: "Lifestyle", created_at: new Date().toISOString() },
  ]

  return (
    <AdminDashboard products={products} orders={orders} categories={categories} promoCodes={promoCodes} stats={stats} />
  )
}
