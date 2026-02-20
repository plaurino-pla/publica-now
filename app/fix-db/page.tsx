'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function FixDbPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFixDb = async () => {
    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/fix-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Database Fix Tool
          </CardTitle>
          <CardDescription>
            This tool will create the missing database tables needed for like/save functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleFixDb} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing Database...
              </>
            ) : (
              'Fix Database Tables'
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Error:</span>
              </div>
              <p className="mt-2 text-red-700">{error}</p>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Success!</span>
                </div>
                <p className="mt-2 text-green-700">{results.message}</p>
              </div>

              {results.results && results.results.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Table Creation Results:</h4>
                  <ul className="space-y-1">
                    {results.results.map((result: string, index: number) => (
                      <li key={index} className="text-sm">
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.testResults && results.testResults.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Test Results:</h4>
                  <ul className="space-y-1">
                    {results.testResults.map((result: string, index: number) => (
                      <li key={index} className="text-sm">
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800 text-sm">
                  <strong>Next steps:</strong> Try liking or saving an article now. The functionality should work!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
