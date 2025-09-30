"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
// import { usePromoCodes } from "@/components/admin/promo-code-context"
import { validateAndApplyPromoCode } from "@/lib/promo-discount"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { items, getTotal, clearCart } = useCart()
  // const { promoCodes } = usePromoCodes()
  const [promoCodes, setPromoCodes] = useState<any[]>([])
  useEffect(() => {
    if (open) {
      fetch("/api/admin/promo-codes")
        .then((res) => res.json())
        .then((data) => {
          // Map backend 'active' to UI 'is_active'
          const codes = (data.promoCodes || []).map((promo: any) => {
            const { active, ...rest } = promo
            return { ...rest, is_active: typeof active === 'boolean' ? active : !!active }
          })
          setPromoCodes(codes)
        })
    }
  }, [open])
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoMessage, setPromoMessage] = useState<string | null>(null)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const regularSubtotal = getTotal()
  let subtotal = regularSubtotal
  let finalTotal = regularSubtotal
  if (promoApplied && discount > 0) {
    subtotal = regularSubtotal
    finalTotal = Math.max(regularSubtotal - discount, 0)
  }

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return
    setIsLoading(true)
    setTimeout(() => {
      const result = validateAndApplyPromoCode({
        code: promoCode,
        subtotal: regularSubtotal,
        promoCodes,
      })
      if (result.valid) {
        setDiscount(result.discount)
        setPromoApplied(true)
        setPromoMessage(result.message)
        toast({
          title: "Promo code applied!",
          description: `You saved $${result.discount.toFixed(2)}`,
        })
      } else {
        setDiscount(0)
        setPromoApplied(false)
        setPromoMessage(result.message)
        toast({
          title: "Invalid promo code",
          description: result.message,
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }, 300)
  }

  const handleSubmitOrder = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
      toast({
        title: "Missing information",
        description: "Please fill in your name, email, and shipping address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          shipping_address: customerInfo.address,
          promo_code: promoCode || undefined,
          items: items.map((item) => ({
            product_id: Number.parseInt(item.id),
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.price,
          })),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Send order info to email
        try {
          const emailRes = await fetch("/api/email-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              items: items.map((item) => ({
                id: item.id,
                name: item.name,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                price: item.price,
                image_url: item.image_url || null,
              })),
              total_amount: finalTotal,
            }),
          })
          if (!emailRes.ok) {
            const errText = await emailRes.text()
            toast({
              title: "Order placed, but email failed",
              description: errText,
              variant: "destructive",
            })
            console.error("Email API error:", errText)
          } else {
            toast({
              title: "Order placed successfully!",
              description: "You will receive a confirmation email shortly.",
            })
          }
        } catch (e) {
          toast({
            title: "Order placed, but email failed",
            description: e instanceof Error ? e.message : "Email error.",
            variant: "destructive",
          })
          console.error("Email send error:", e)
        }
        clearCart()
        onOpenChange(false)
      } else {
        throw new Error(data.error || "Failed to place order")
      }
    } catch (error) {
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Failed to place order.",
        variant: "destructive",
      })
      console.error("Order error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span>{item.name}</span>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Size {item.size}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.color}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Qty: {item.quantity}
                      </Badge>
                    </div>
                  </div>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Promo Code */}
          <div>
            <h3 className="font-semibold mb-3">Promo Code</h3>
            <div className="flex gap-2">
              <Input placeholder="Enter promo code" value={promoCode} onChange={(e) => {
                setPromoCode(e.target.value)
                setPromoApplied(false)
                setDiscount(0)
                setPromoMessage(null)
              }} />
              <Button variant="outline" onClick={handleApplyPromo} disabled={isLoading || !promoCode.trim()}>
                Apply
              </Button>
            </div>
            {promoMessage && (
              <div className={`text-sm mt-1 ${promoApplied ? 'text-green-600' : 'text-red-600'}`}>{promoMessage}</div>
            )}
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Shipping Address</Label>
                <Textarea
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  placeholder="Enter your full shipping address"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Total */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${promoApplied && discount > 0 ? regularSubtotal.toFixed(2) : subtotal.toFixed(2)}</span>
            </div>
            {promoApplied && discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>- ${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold border-t pt-2 mt-2">
              <span>Total:</span>
              <span className="text-orange-600">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="lg"
            onClick={handleSubmitOrder}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : `Place Order - $${finalTotal.toFixed(2)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
