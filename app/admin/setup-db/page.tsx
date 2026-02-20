'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/dashboard/page-header'
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import AuthGuard from '@/components/auth-guard'

export default function SetupDatabasePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const setupDatabase = async () => {
    setIsLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch('/api/setup/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to setup database')
      }
    } catch (err) {
      setError('An error occurred while setting up the database')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Database Setup" 
          subtitle="Create missing database tables for likes, reading list, and other features"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-6 h-6" />
                Database Tables Setup
              </CardTitle>
              <CardDescription>
                This will create the missing database tables needed for likes, reading list, subscriptions, and purchases functionality.
                Only creator owners can run this setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-medium">i</span>
                  </div>
                  <h4 className="font-medium text-blue-900">What will be created?</h4>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>likes</strong> table - for article likes</li>
                  <li>• <strong>readingListItems</strong> table - for saved articles</li>
                  <li>• <strong>subscriptions</strong> table - for creator subscriptions</li>
                  <li>• <strong>purchases</strong> table - for article purchases</li>
                  <li>• Foreign key constraints for data integrity</li>
                </ul>
              </div>

              <Button 
                onClick={setupDatabase}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Setting up database...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Setup Database Tables
                  </>
                )}
              </Button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">Error</span>
                  </div>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Setup Results</span>
                  </div>
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div key={index} className="text-sm text-green-800">
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 text-center">
                <p>This operation is safe and will not affect existing data.</p>
                <p>Tables will only be created if they don't already exist.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
