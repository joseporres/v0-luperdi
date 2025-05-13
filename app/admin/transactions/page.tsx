import { redirect } from "next/navigation"
import { format } from "date-fns"

import { getAllTransactions } from "@/app/actions/transactions"
import { isAdmin } from "@/app/actions/auth"
import { TransactionFilters } from "@/components/admin/transaction-filters"
import { TransactionStatusBadge } from "@/components/admin/transaction-status-badge"
import { TransactionActions } from "@/components/admin/transaction-actions"

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Check if user is admin
  const userIsAdmin = await isAdmin()

  if (!userIsAdmin) {
    redirect("/")
  }

  // Parse filters from search params
  const filters = {
    status: typeof searchParams.status === "string" ? searchParams.status : undefined,
    department: typeof searchParams.department === "string" ? searchParams.department : undefined,
    dateFrom: typeof searchParams.dateFrom === "string" ? searchParams.dateFrom : undefined,
    dateTo: typeof searchParams.dateTo === "string" ? searchParams.dateTo : undefined,
  }

  // Get transactions with filters
  const transactions = await getAllTransactions(filters)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
      </div>

      <TransactionFilters />

      <div className="bg-white dark:bg-neutral-800 rounded-md shadow overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Buyer</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Shipping</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const product = transaction.products
                const variant = transaction.product_variants
                const buyer = transaction.profiles
                const size = variant?.sizes?.name

                return (
                  <tr key={transaction.id} className="border-b border-neutral-200 dark:border-neutral-700">
                    <td className="px-4 py-3 text-sm">
                      <span className="font-mono text-xs">{transaction.id.slice(0, 8)}...</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {product?.name}
                      {size && <span className="text-neutral-500 ml-1">({size})</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {buyer?.first_name} {buyer?.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      ${transaction.price.toFixed(2)} x {transaction.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm">{format(new Date(transaction.created_at), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-xs">
                        <div>
                          {transaction.department}, {transaction.province}
                        </div>
                        <div className="text-neutral-500 truncate max-w-[150px]">{transaction.address}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <TransactionStatusBadge status={transaction.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <TransactionActions transaction={transaction} />
                    </td>
                  </tr>
                )
              })}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-neutral-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
