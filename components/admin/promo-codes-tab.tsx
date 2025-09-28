"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { AddPromoCodeModal } from "@/components/admin/add-promo-code-modal"
import { useToast } from "@/hooks/use-toast"
import { usePromoCodes } from "@/components/admin/promo-code-context"

interface PromoCode {
  id: string
  code: string
  discount_type: string
  discount_value: number
  min_order_amount: number
  max_uses?: number
  current_uses: number
  is_active: boolean
  expires_at?: string
}

interface PromoCodesTabProps {
  promoCodes: PromoCode[]
}

export function PromoCodesTab({ promoCodes }: PromoCodesTabProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { toast } = useToast()
  const { promoCodes: contextPromoCodes, updatePromoCode, deletePromoCode } = usePromoCodes()

  const togglePromoCodeStatus = async (promoId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/promo-codes/${promoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      })
      if (response.ok) {
        updatePromoCode(promoId, { is_active: !currentStatus })
        toast({
          title: "Promo code updated",
          description: `Promo code ${!currentStatus ? "activated" : "deactivated"} successfully.`,
        })
      } else {
        throw new Error("Failed to update promo code")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update promo code status.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Promo Codes Management
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Promo Code
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contextPromoCodes.map((promo) => (
            <div key={promo.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{promo.code}</h3>
                  <Badge variant={promo.is_active ? "default" : "secondary"}>
                    {promo.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {promo.discount_type === "percentage"
                      ? `${promo.discount_value}% off`
                      : `$${promo.discount_value} off`}
                  </span>
                  <span>Min order: ${promo.min_order_amount}</span>
                  {promo.max_uses && (
                    <span>
                      Uses: {promo.current_uses}/{promo.max_uses}
                    </span>
                  )}
                  {promo.expires_at && <span>Expires: {new Date(promo.expires_at).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => togglePromoCodeStatus(promo.id, promo.is_active)}>
                  {promo.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="text-destructive bg-transparent">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <AddPromoCodeModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </Card>
  )
}
