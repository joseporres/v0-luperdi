"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseClient } from "@/lib/supabase/client"

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
  // Add more provinces as needed
}

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  department?: string | null
  province?: string | null
  address?: string | null
}

export function AddressForm({ profile }: { profile: Profile }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [department, setDepartment] = useState<string>(profile.department || "")
  const [province, setProvince] = useState<string>(profile.province || "")
  const [formData, setFormData] = useState({
    address: profile.address || "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase
        .from("profiles")
        .update({
          department,
          province,
          address: formData.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) {
        throw error
      }

      setSuccess("Address updated successfully")
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your address")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Shipping Address</h2>
        <p className="text-sm text-muted-foreground mt-1">Update your shipping address information</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            name="department"
            value={department}
            onValueChange={(value) => {
              setDepartment(value)
              setProvince("")
            }}
          >
            <SelectTrigger>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">Province</Label>
          <Select name="province" value={province} onValueChange={setProvince} disabled={!department}>
            <SelectTrigger>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address, apartment, etc."
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Address"}
        </Button>
      </form>
    </div>
  )
}
