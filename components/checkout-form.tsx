"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createTransaction } from "@/app/actions/transactions"
import type { CartItem } from "@/lib/cart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TriangleIcon as ExclamationTriangleIcon, CreditCardIcon } from "lucide-react"

// Peru departments
const DEPARTMENTS = [
  "Lima",
  "Arequipa",
  "Cusco",
  "La Libertad",
  "Piura",
  "Lambayeque",
  "Junín",
  "Áncash",
  "Cajamarca",
  "Puno",
  "Loreto",
  "Ica",
  "San Martín",
  "Tacna",
  "Ucayali",
  "Huánuco",
  "Ayacucho",
  "Amazonas",
  "Apurímac",
  "Huancavelica",
  "Madre de Dios",
  "Moquegua",
  "Pasco",
  "Tumbes",
]

// Sample provinces for each department (simplified)
const PROVINCES: Record<string, string[]> = {
  Lima: ["Lima", "Barranca", "Cajatambo", "Canta", "Cañete", "Huaral", "Huarochirí", "Huaura", "Oyón", "Yauyos"],
  Arequipa: ["Arequipa", "Camaná", "Caravelí", "Castilla", "Caylloma", "Condesuyos", "Islay", "La Unión"],
  Cusco: [
    "Cusco",
    "Acomayo",
    "Anta",
    "Calca",
    "Canas",
    "Canchis",
    "Chumbivilcas",
    "Espinar",
    "La Convención",
    "Paruro",
    "Paucartambo",
    "Quispicanchi",
    "Urubamba",
  ],
  "La Libertad": [
    "Trujillo",
    "Ascope",
    "Bolívar",
    "Chepén",
    "Julcán",
    "Otuzco",
    "Pacasmayo",
    "Pataz",
    "Sánchez Carrión",
    "Santiago de Chuco",
    "Gran Chimú",
    "Virú",
  ],
  Piura: ["Piura", "Ayabaca", "Huancabamba", "Morropón", "Paita", "Sullana", "Talara", "Sechura"],
  // Add more provinces as needed for other departments
}

// Test card numbers for demo purposes
const TEST_CARDS = {
  success: "4111111111111111", // Always succeeds
  insufficient: "4242424242424242", // Insufficient funds error
  declined: "4000000000000002", // Card declined error
}

interface CheckoutFormProps {
  cart: CartItem[]
  profile: any
}

export function CheckoutForm({ cart, profile }: CheckoutFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [department, setDepartment] = useState<string>(profile?.department || "")
  const [province, setProvince] = useState<string>(profile?.province || "")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card")

  const validateForm = (formData: FormData): boolean => {
    const errors: Record<string, string> = {}

    // Required fields
    const requiredFields = ["first_name", "last_name", "email", "department", "province", "address", "payment_method"]

    requiredFields.forEach((field) => {
      const value = formData.get(field)
      if (!value || (typeof value === "string" && value.trim() === "")) {
        errors[field] = "This field is required"
      }
    })

    // Validate card details if credit card is selected
    if (formData.get("payment_method") === "credit_card") {
      const cardNumber = formData.get("card_number") as string
      const expiryDate = formData.get("expiry_date") as string
      const cvv = formData.get("cvv") as string

      if (!cardNumber || cardNumber.trim() === "") {
        errors["card_number"] = "Card number is required"
      } else if (!/^\d{15,16}$/.test(cardNumber.replace(/\s/g, ""))) {
        errors["card_number"] = "Card number must be 15-16 digits"
      }

      if (!expiryDate || expiryDate.trim() === "") {
        errors["expiry_date"] = "Expiry date is required"
      } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        errors["expiry_date"] = "Expiry date must be in MM/YY format"
      }

      if (!cvv || cvv.trim() === "") {
        errors["cvv"] = "CVV is required"
      } else if (!/^\d{3,4}$/.test(cvv)) {
        errors["cvv"] = "CVV must be 3-4 digits"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setPaymentError(null)

    try {
      const formData = new FormData(event.currentTarget)

      // Validate form
      if (!validateForm(formData)) {
        setIsSubmitting(false)
        toast({
          title: "Form Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // For simplicity, we'll just process the first item in the cart
      // In a real app, you would create multiple transactions or a single transaction with multiple items
      const item = cart[0]

      // Add cart item details to form data
      formData.append("product_id", item.productId)

      // Handle variant_id - ensure it's never empty or undefined
      // If variantId is empty or undefined, use a default value or the product ID
      const variantId = item.variantId || item.productId
      formData.append("variant_id", variantId)

      formData.append("price", item.price.toString())
      formData.append("quantity", item.quantity.toString())

      // Log form data for debugging (remove in production)
      console.log("Submitting form data:", Object.fromEntries(formData.entries()))

      const result = await createTransaction(formData)

      if (result.error) {
        console.error("Transaction error:", result.error)

        // Handle payment-specific errors differently
        if (result.paymentError) {
          setPaymentError(result.error)
          // Scroll to the payment error message
          setTimeout(() => {
            document.getElementById("payment-error")?.scrollIntoView({ behavior: "smooth" })
          }, 100)
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Success",
          description: "Your order has been placed successfully!",
        })
        // Redirect to the order confirmation page
        router.push(`/order-confirmation/${result.transactionId}`)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to format card number with spaces
  const formatCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    let value = input.value.replace(/\D/g, "")
    value = value.substring(0, 16)

    // Format with spaces every 4 digits
    const parts = []
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4))
    }

    input.value = parts.join(" ")
  }

  // Helper function to format expiry date
  const formatExpiryDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const value = input.value.replace(/\D/g, "")

    if (value.length > 2) {
      input.value = `${value.substring(0, 2)}/${value.substring(2, 4)}`
    } else {
      input.value = value
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {paymentError && (
        <Alert variant="destructive" id="payment-error">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Payment Failed</AlertTitle>
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="flex items-center">
                First Name <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="first_name"
                name="first_name"
                defaultValue={profile?.first_name || ""}
                className={formErrors.first_name ? "border-red-500" : ""}
                required
              />
              {formErrors.first_name && <p className="text-red-500 text-sm mt-1">{formErrors.first_name}</p>}
            </div>
            <div>
              <Label htmlFor="last_name" className="flex items-center">
                Last Name <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="last_name"
                name="last_name"
                defaultValue={profile?.last_name || ""}
                className={formErrors.last_name ? "border-red-500" : ""}
                required
              />
              {formErrors.last_name && <p className="text-red-500 text-sm mt-1">{formErrors.last_name}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center">
              Email <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={profile?.email || ""}
              className={formErrors.email ? "border-red-500" : ""}
              required
            />
            {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <Label htmlFor="department" className="flex items-center">
              Department <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              name="department"
              value={department}
              onValueChange={(value) => {
                setDepartment(value)
                setProvince("")
              }}
              required
            >
              <SelectTrigger className={formErrors.department ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.department && <p className="text-red-500 text-sm mt-1">{formErrors.department}</p>}
          </div>

          <div>
            <Label htmlFor="province" className="flex items-center">
              Province <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select name="province" value={province} onValueChange={setProvince} disabled={!department} required>
              <SelectTrigger className={formErrors.province ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                {department &&
                  PROVINCES[department]?.map((prov) => (
                    <SelectItem key={prov} value={prov}>
                      {prov}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {formErrors.province && <p className="text-red-500 text-sm mt-1">{formErrors.province}</p>}
          </div>

          <div>
            <Label htmlFor="address" className="flex items-center">
              Address <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Street address, apartment, etc."
              className={formErrors.address ? "border-red-500" : ""}
              defaultValue={profile?.address || ""}
              required
            />
            {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

        <RadioGroup
          defaultValue="credit_card"
          name="payment_method"
          className="space-y-4"
          value={paymentMethod}
          onValueChange={setPaymentMethod}
        >
          <div
            className={`flex items-center space-x-2 border p-4 rounded-md ${
              formErrors.payment_method ? "border-red-500" : ""
            }`}
          >
            <RadioGroupItem value="credit_card" id="credit_card" />
            <Label htmlFor="credit_card" className="flex-1">
              Credit Card
            </Label>
            <div className="flex space-x-1">
              <CreditCardIcon className="h-5 w-5 text-neutral-500" />
            </div>
          </div>

          <div
            className={`flex items-center space-x-2 border p-4 rounded-md ${
              formErrors.payment_method ? "border-red-500" : ""
            }`}
          >
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="flex-1">
              PayPal
            </Label>
            <div className="w-8 h-5 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          </div>

          <div
            className={`flex items-center space-x-2 border p-4 rounded-md ${
              formErrors.payment_method ? "border-red-500" : ""
            }`}
          >
            <RadioGroupItem value="bank_transfer" id="bank_transfer" />
            <Label htmlFor="bank_transfer" className="flex-1">
              Bank Transfer
            </Label>
          </div>
        </RadioGroup>
        {formErrors.payment_method && <p className="text-red-500 text-sm mt-1">{formErrors.payment_method}</p>}

        {/* Credit Card Details */}
        {paymentMethod === "credit_card" && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div>
              <Label htmlFor="card_number" className="flex items-center">
                Card Number <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="card_number"
                name="card_number"
                placeholder="1234 5678 9012 3456"
                className={formErrors.card_number ? "border-red-500" : ""}
                onChange={formatCardNumber}
                maxLength={19} // 16 digits + 3 spaces
                required
              />
              {formErrors.card_number && <p className="text-red-500 text-sm mt-1">{formErrors.card_number}</p>}
              <p className="text-xs text-neutral-500 mt-1">
                For testing: Use {TEST_CARDS.success} for success, {TEST_CARDS.insufficient} for insufficient funds,
                {TEST_CARDS.declined} for declined card
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry_date" className="flex items-center">
                  Expiry Date <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="expiry_date"
                  name="expiry_date"
                  placeholder="MM/YY"
                  className={formErrors.expiry_date ? "border-red-500" : ""}
                  onChange={formatExpiryDate}
                  maxLength={5} // MM/YY
                  required
                />
                {formErrors.expiry_date && <p className="text-red-500 text-sm mt-1">{formErrors.expiry_date}</p>}
              </div>
              <div>
                <Label htmlFor="cvv" className="flex items-center">
                  CVV <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="cvv"
                  name="cvv"
                  type="text"
                  placeholder="123"
                  className={formErrors.cvv ? "border-red-500" : ""}
                  maxLength={4}
                  required
                />
                {formErrors.cvv && <p className="text-red-500 text-sm mt-1">{formErrors.cvv}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-neutral-500">
          <p>This is a demo checkout. No actual payment will be processed.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden">
                <Image
                  src={item.imageUrl || "/placeholder.svg?height=64&width=64"}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{item.name}</p>
                {item.size && <p className="text-sm text-neutral-500">Size: {item.size}</p>}
                <p className="text-sm">
                  ${item.price.toFixed(2)} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : "Complete Purchase"}
      </Button>
    </form>
  )
}
