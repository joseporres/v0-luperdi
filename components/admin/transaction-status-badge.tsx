import { Badge } from "@/components/ui/badge"

interface TransactionStatusBadgeProps {
  status: string
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  switch (status.toLowerCase()) {
    case "pending":
      return <Badge variant="outline">Pending</Badge>
    case "processing":
      return <Badge variant="secondary">Processing</Badge>
    case "shipped":
      return <Badge>Shipped</Badge>
    case "delivered":
      return <Badge className="bg-green-500">Delivered</Badge>
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
