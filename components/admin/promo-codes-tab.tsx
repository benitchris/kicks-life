"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  const [editPromo, setEditPromo] = useState<PromoCode | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const handleEditPromo = (promo: PromoCode) => {
    setEditPromo(promo)
    setEditModalOpen(true)
  }

  const handleToggleStatus = async () => {
    if (!editPromo) return
    try {
      const response = await fetch(`/api/admin/promo-codes/${editPromo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !editPromo.is_active }),
      })
      if (response.ok) {
        const updated = await response.json()
        // Map backend 'active' to UI 'is_active' and remove 'active' from UI state
        const { active, ...rest } = updated
        const promoForUI = { ...rest, is_active: active }
        updatePromoCode(editPromo.id, promoForUI)
        setEditPromo(promoForUI)
      }
    } catch {}
  }

  const getPromoStatusLabel = (promo: PromoCode) => {
    if (promo.expires_at) {
      const now = new Date()
      const exp = new Date(promo.expires_at)
      if (exp < now) return <span className="text-red-600 font-semibold">Long Overdue</span>
      return <span className="text-green-600 font-semibold">Still Viable</span>
    }
    return <span className="text-gray-500">No Expiry</span>
  }

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
                <Button variant="outline" size="icon" onClick={() => handleEditPromo(promo)}>
                  <Edit className="h-4 w-4" />
                </Button>
      {/* Edit Promo Code Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Promo Code</DialogTitle>
          </DialogHeader>
          {editPromo && (
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Code:</span> {editPromo.code}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {editPromo.is_active ? "Active" : "Inactive"}
                <Button onClick={handleToggleStatus} className="ml-4" variant={editPromo.is_active ? "secondary" : "default"}>
                  {editPromo.is_active ? "Set Inactive" : "Set Active"}
                </Button>
              </div>
              <div>
                <span className="font-semibold">Expiry:</span> {getPromoStatusLabel(editPromo)}
              </div>
              <div>
                <span className="font-semibold">Discount:</span> {editPromo.discount_type === "percentage" ? `${editPromo.discount_value}%` : `$${editPromo.discount_value}`}
              </div>
              <div>
                <span className="font-semibold">Min Order:</span> ${editPromo.min_order_amount}
              </div>
              {editPromo.max_uses && (
                <div>
                  <span className="font-semibold">Uses:</span> {editPromo.current_uses}/{editPromo.max_uses}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
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
