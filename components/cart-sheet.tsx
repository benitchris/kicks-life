"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { CheckoutModal } from "@/components/checkout-modal"
import { useState } from "react"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, updateQuantity, removeItem, getTotal } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const handleCheckout = () => {
    setIsCheckoutOpen(true)
    onOpenChange(false)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Shopping Cart ({items.length})</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                    <img
                      src={item.image_url || "/placeholder.svg?height=80&width=80"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Size {item.size}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.color}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 bg-transparent"
                            onClick={() =>
                              updateQuantity(item.id, item.size, item.color, Math.max(0, item.quantity - 1))
                            }
                          >
                            <span className="text-xs">−</span>
                          </Button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 bg-transparent"
                            onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                          >
                            <span className="text-xs">+</span>
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-orange-600">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeItem(item.id, item.size, item.color)}
                          >
                            <span className="text-xs">🗑️</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <SheetFooter className="border-t pt-4">
              <div className="w-full space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-orange-600">${getTotal().toFixed(2)}</span>
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutModal open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </>
  )
}
