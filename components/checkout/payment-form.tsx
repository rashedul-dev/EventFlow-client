"use client"

import { useState, useActionState } from "react"
import { cn } from "@/lib/utils"
import { FormField } from "@/components/forms/form-field"
import { FormInput } from "@/components/forms/form-input"
import { FormCheckbox } from "@/components/forms/form-checkbox"
import { CreditCard, Lock, Loader2 } from "lucide-react"

interface PaymentFormProps {
  amount: number
  currency?: string
  onSubmit: (data: PaymentData) => Promise<{ success: boolean; error?: string }>
  className?: string
}

interface PaymentData {
  billingName: string
  billingEmail: string
  cardNumber: string
  expiryDate: string
  cvc: string
  acceptTerms: boolean
}

export function PaymentForm({ amount, currency = "USD", onSubmit, className }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentData>({
    billingName: "",
    billingEmail: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentData, string>>>({})

  const submitAction = async (_: { success: boolean; error?: string } | null) => {
    // Validate
    const newErrors: Partial<Record<keyof PaymentData, string>> = {}

    if (!formData.billingName.trim()) newErrors.billingName = "Name is required"
    if (!formData.billingEmail.trim()) newErrors.billingEmail = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) newErrors.billingEmail = "Invalid email"

    if (!formData.cardNumber.replace(/\s/g, "").match(/^\d{16}$/)) newErrors.cardNumber = "Invalid card number"
    if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) newErrors.expiryDate = "Invalid expiry (MM/YY)"
    if (!formData.cvc.match(/^\d{3,4}$/)) newErrors.cvc = "Invalid CVC"

    if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept the terms"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return { success: false, error: "Please fix the errors above" }
    }

    setErrors({})
    return await onSubmit(formData)
  }

  const [state, formAction, isPending] = useActionState(submitAction, null)

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(" ") : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price)
  }

  return (
    <form action={formAction} className={cn("space-y-6", className)}>
      {/* Order Summary */}
      <div className="p-4 rounded-xl bg-secondary/10 border border-secondary">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(amount)}</span>
        </div>
      </div>

      {/* Billing Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          Billing Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name" htmlFor="billingName" error={errors.billingName} required>
            <FormInput
              id="billingName"
              placeholder="John Doe"
              value={formData.billingName}
              onChange={(e) => setFormData({ ...formData, billingName: e.target.value })}
              error={!!errors.billingName}
            />
          </FormField>

          <FormField label="Email" htmlFor="billingEmail" error={errors.billingEmail} required>
            <FormInput
              id="billingEmail"
              type="email"
              placeholder="john@example.com"
              value={formData.billingEmail}
              onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
              error={!!errors.billingEmail}
            />
          </FormField>
        </div>
      </div>

      {/* Card Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          Card Details
        </h3>

        <FormField label="Card Number" htmlFor="cardNumber" error={errors.cardNumber} required>
          <div className="relative">
            <FormInput
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
              maxLength={19}
              error={!!errors.cardNumber}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <div className="w-8 h-5 rounded bg-gradient-to-r from-blue-600 to-blue-400" />
              <div className="w-8 h-5 rounded bg-gradient-to-r from-red-500 to-yellow-500" />
            </div>
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Expiry Date" htmlFor="expiryDate" error={errors.expiryDate} required>
            <FormInput
              id="expiryDate"
              placeholder="MM/YY"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: formatExpiry(e.target.value) })}
              maxLength={5}
              error={!!errors.expiryDate}
            />
          </FormField>

          <FormField label="CVC" htmlFor="cvc" error={errors.cvc} required>
            <FormInput
              id="cvc"
              placeholder="123"
              value={formData.cvc}
              onChange={(e) => setFormData({ ...formData, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              maxLength={4}
              error={!!errors.cvc}
            />
          </FormField>
        </div>
      </div>

      {/* Terms */}
      <FormCheckbox
        label="I agree to the Terms of Service and Privacy Policy"
        checked={formData.acceptTerms}
        onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
        error={!!errors.acceptTerms}
      />

      {/* Error Message */}
      {state?.error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">{state.error}</div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          "w-full py-4 rounded-xl bg-primary text-black font-semibold text-lg transition-all",
          "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2",
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5" />
            Pay {formatPrice(amount)}
          </>
        )}
      </button>

      {/* Security Notice */}
      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <Lock className="h-3 w-3" />
        Secured by 256-bit SSL encryption
      </p>
    </form>
  )
}
