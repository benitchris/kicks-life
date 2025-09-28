"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { usePromoCodes } from "@/components/admin/promo-code-context"
import { useToast } from "@/hooks/use-toast"

interface AddPromoCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPromoCodeModal({ open, onOpenChange }: AddPromoCodeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_uses: "",
    expires_at: "",
  })
  const { addPromoCode } = usePromoCodes()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          discount_value: Number.parseFloat(formData.discount_value),
          min_order_amount: Number.parseFloat(formData.min_order_amount) || 0,
          max_uses: formData.max_uses ? Number.parseInt(formData.max_uses) : null,
          expires_at: formData.expires_at || null,
        }),
      })

      if (response.ok) {
        const newPromo = await response.json()
        addPromoCode(newPromo)
        toast({
          title: "Promo code added",
          description: "Promo code has been created successfully.",
        })
        onOpenChange(false)
        // Reset form
        setFormData({
          code: "",
          discount_type: "percentage",
          discount_value: "",
          min_order_amount: "",
          max_uses: "",
          expires_at: "",
        })
      } else {
        throw new Error("Failed to add promo code")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add promo code.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Promo Code</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Promo Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="SAVE20"
              required
            />
          </div>

          <div>
            <Label htmlFor="discount_type">Discount Type *</Label>
            <Select
              value={formData.discount_type}
              onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="discount_value">
              Discount Value * ({formData.discount_type === "percentage" ? "%" : "$"})
            </Label>
            <Input
              id="discount_value"
              type="number"
              step="0.01"
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="min_order_amount">Minimum Order Amount ($)</Label>
            <Input
              id="min_order_amount"
              type="number"
              step="0.01"
              value={formData.min_order_amount}
              onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="max_uses">Maximum Uses (optional)</Label>
            <Input
              id="max_uses"
              type="number"
              value={formData.max_uses}
              onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div>
            <Label htmlFor="expires_at">Expiration Date (optional)</Label>
            <Input
              id="expires_at"
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
              {isLoading ? "Creating..." : "Create Promo Code"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
