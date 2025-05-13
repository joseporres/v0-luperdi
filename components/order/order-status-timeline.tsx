"use client"

import { CheckCircle2, Clock, Package, Truck } from "lucide-react"

interface OrderStatusTimelineProps {
  status: string
  createdAt: string
}

export function OrderStatusTimeline({ status, createdAt }: OrderStatusTimelineProps) {
  // Define the order status steps
  const steps = [
    { id: "pending", label: "Order Placed", icon: Clock },
    { id: "processing", label: "Processing", icon: Package },
    { id: "shipped", label: "Shipped", icon: Truck },
    { id: "delivered", label: "Delivered", icon: CheckCircle2 },
  ]

  // Map the current status to a step index
  const getStatusIndex = (currentStatus: string) => {
    const statusMap: Record<string, number> = {
      pending: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
    }
    return statusMap[currentStatus] || 0
  }

  const currentStepIndex = getStatusIndex(status)

  // Calculate dates for each step
  const orderDate = new Date(createdAt)

  const processingDate = new Date(createdAt)
  processingDate.setDate(orderDate.getDate() + 1)

  const shippedDate = new Date(createdAt)
  shippedDate.setDate(orderDate.getDate() + 2)

  const deliveredDate = new Date(createdAt)
  deliveredDate.setDate(orderDate.getDate() + 7)

  const stepDates = [
    orderDate,
    currentStepIndex >= 1 ? processingDate : null,
    currentStepIndex >= 2 ? shippedDate : null,
    currentStepIndex >= 3 ? deliveredDate : null,
  ]

  return (
    <div className="py-4">
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200"></div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStepIndex
            const isPending = index === currentStepIndex + 1
            const isFuture = index > currentStepIndex + 1

            return (
              <div key={step.id} className="relative flex items-start">
                <div className="flex h-10 w-10 items-center justify-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isCompleted
                        ? "bg-green-100 text-green-600"
                        : isPending
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex justify-between">
                    <h3
                      className={`text-sm font-medium ${
                        isCompleted ? "text-green-600" : isPending ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </h3>
                    {stepDates[index] && (
                      <p
                        className={`text-xs ${
                          isCompleted ? "text-green-600" : isPending ? "text-blue-600" : "text-gray-500"
                        }`}
                      >
                        {stepDates[index]?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {isCompleted ? "Completed" : isPending ? "In progress" : isFuture ? "Pending" : ""}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
