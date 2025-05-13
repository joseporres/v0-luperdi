"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"

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

export function TransactionFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Get current filter values from URL
  const currentStatus = searchParams.get("status") || ""
  const currentDepartment = searchParams.get("department") || ""
  const currentDateFrom = searchParams.get("dateFrom") || ""
  const currentDateTo = searchParams.get("dateTo") || ""

  // Local state for date pickers
  const [dateFrom, setDateFrom] = useState<Date | undefined>(currentDateFrom ? new Date(currentDateFrom) : undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(currentDateTo ? new Date(currentDateTo) : undefined)

  const applyFilters = (newFilters: Record<string, string | null>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      // Update params with new filters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })

      router.push(`/admin/transactions?${params.toString()}`)
    })
  }

  const resetFilters = () => {
    startTransition(() => {
      router.push("/admin/transactions")
      setDateFrom(undefined)
      setDateTo(undefined)
    })
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-md shadow p-4 flex flex-wrap gap-4 items-end">
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={currentStatus} onValueChange={(value) => applyFilters({ status: value || null })}>
          <SelectTrigger id="status" className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="department">Department</Label>
        <Select value={currentDepartment} onValueChange={(value) => applyFilters({ department: value || null })}>
          <SelectTrigger id="department" className="w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Date From</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={(date) => {
                setDateFrom(date)
                applyFilters({
                  dateFrom: date ? format(date, "yyyy-MM-dd") : null,
                })
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label>Date To</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={(date) => {
                setDateTo(date)
                applyFilters({
                  dateTo: date ? format(date, "yyyy-MM-dd") : null,
                })
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button variant="outline" onClick={resetFilters} disabled={isPending}>
        Reset Filters
      </Button>
    </div>
  )
}
