"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function ProductError({ onRetry }: { onRetry?: () => void }) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>There was a problem loading the products. This could be due to:</p>
        <ul className="list-disc pl-5">
          <li>Database connection issues</li>
          <li>Authentication problems</li>
          <li>Server errors</li>
        </ul>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="mt-2 w-fit">
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
