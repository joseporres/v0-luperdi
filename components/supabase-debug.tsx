"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { clearSupabaseAuth, testSupabaseConnection } from "@/lib/supabase/auth-utils"
import { supabaseConfig } from "@/lib/supabase/config"

export function SupabaseDebug() {
  const [testResult, setTestResult] = useState<any>(null)
  const [clearResult, setClearResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTestConnection = async () => {
    setIsLoading(true)
    const result = await testSupabaseConnection()
    setTestResult(result)
    setIsLoading(false)
  }

  const handleClearAuth = async () => {
    setIsLoading(true)
    const result = await clearSupabaseAuth()
    setClearResult(result)
    setIsLoading(false)
    // Reload the page after clearing auth data
    if (result.success) {
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Supabase Connection Debugger</CardTitle>
        <CardDescription>Use these tools to diagnose and fix Supabase connection issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <h3 className="text-lg font-medium">Current Configuration</h3>
          <div className="bg-gray-100 p-4 rounded-md overflow-auto">
            <pre className="text-xs">
              {JSON.stringify(
                {
                  url: supabaseConfig.url,
                  anonKey:
                    supabaseConfig.anonKey.substring(0, 5) +
                    "..." +
                    supabaseConfig.anonKey.substring(supabaseConfig.anonKey.length - 5),
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>

        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            <AlertTitle>{testResult.success ? "Connection Successful" : "Connection Failed"}</AlertTitle>
            <AlertDescription>
              <div className="mt-2 text-sm">
                <p>{testResult.message}</p>
                {testResult.hint && <p className="mt-1 font-medium">Hint: {testResult.hint}</p>}
                {testResult.code && <p className="mt-1">Error Code: {testResult.code}</p>}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {clearResult && (
          <Alert variant={clearResult.success ? "default" : "destructive"}>
            <AlertTitle>{clearResult.success ? "Auth Data Cleared" : "Failed to Clear Auth Data"}</AlertTitle>
            <AlertDescription>
              {clearResult.success
                ? "All Supabase authentication data has been cleared. The page will reload shortly."
                : "Failed to clear authentication data. See console for details."}
            </AlertDescription>
          </Alert>
        )}

        {testResult && !testResult.success && testResult.code === "PGRST301" && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTitle>JWT Signature Error Detected</AlertTitle>
            <AlertDescription>
              <p className="mt-2 text-sm">The "JWSError JWSInvalidSignature" error typically occurs when:</p>
              <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                <li>Your local session data is corrupted or invalid</li>
                <li>There's a mismatch between your Supabase URL and anon key</li>
                <li>Your Supabase project has been reconfigured since your last login</li>
              </ul>
              <p className="mt-2 text-sm font-medium">
                Try clearing your auth data using the button below to resolve this issue.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleTestConnection} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Connection"}
        </Button>
        <Button onClick={handleClearAuth} variant="outline" disabled={isLoading}>
          {isLoading ? "Clearing..." : "Clear Auth Data"}
        </Button>
      </CardFooter>
    </Card>
  )
}
