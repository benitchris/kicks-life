"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, ShoppingCart, Tag, BarChart3 } from "lucide-react"
import { ProductsTab } from "@/components/admin/products-tab"
import { OrdersTab } from "@/components/admin/orders-tab"
import { PromoCodesTab } from "@/components/admin/promo-codes-tab"
import { AddProductModal } from "@/components/admin/add-product-modal"
import { ProductProvider, useProducts } from "@/components/admin/product-context"
import { OrderProvider, useOrders } from "@/components/admin/order-context"
import { PromoCodeProvider, usePromoCodes } from "@/components/admin/promo-code-context"

interface AdminDashboardProps {
  products: any[]
  orders: any[]
  categories: any[]
  promoCodes: any[]
}

export function AdminDashboard({ products, orders, categories, promoCodes }: AdminDashboardProps) {
  return (
    <ProductProvider initialProducts={products}>
      <OrderProvider initialOrders={orders}>
        <PromoCodeProvider initialPromoCodes={promoCodes}>
          <AdminDashboardContent categories={categories} />
        </PromoCodeProvider>
      </OrderProvider>
    </ProductProvider>
  )
}

function AdminDashboardContent({ categories }: { categories: any[] }) {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const { products } = useProducts()
  const { orders } = useOrders()
  const { promoCodes } = usePromoCodes()

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + Number.parseFloat(order.total_amount?.toString() || "0"), 0)
  const pendingOrders = orders.filter((order) => order.status === "pending").length
  const activeProducts = products.filter((product) => product.is_active).length
  const activePromoCodes = promoCodes.filter((code) => code.is_active).length

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-2 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <a href="/" className="text-2xl sm:text-3xl font-bold text-orange-600 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-400 transition">
                Kicks Life 250
              </a>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href="/">Go to Client</a>
              </Button>
            </div>
            <Button onClick={() => setIsAddProductOpen(true)} className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From {orders.length} orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{activeProducts}</div>
              <p className="text-xs text-muted-foreground">Out of {products.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Promo Codes</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{activePromoCodes}</div>
              <p className="text-xs text-muted-foreground">Currently available</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="w-full flex flex-col sm:flex-row gap-2 sm:gap-4">
            <TabsTrigger value="products" className="flex-1">Products</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
            <TabsTrigger value="promo-codes" className="flex-1">Promo Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab categories={categories} />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab orders={orders} />
          </TabsContent>

          <TabsContent value="promo-codes">
            <PromoCodesTab promoCodes={promoCodes} />
          </TabsContent>
        </Tabs>
      </div>

      <AddProductModal open={isAddProductOpen} onOpenChange={setIsAddProductOpen} categories={categories} />
    </div>
  )
}
