import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import AuthGuard from '@/components/auth-guard'
import ArticlesClient from './articles-client'

interface ServerArticle {
  id: string
  title: string
  slug: string
  contentType: string
  status: string
  visibility: string
  tags: string[] | null
  pricing: any
  createdAt: Date
  publishedAt: Date | null
  currentArtifact?: any
}

async function getArticles(userId: string): Promise<ServerArticle[]> {
  try {
    // Get user's creator membership using raw SQL
    const memberships = await prisma.$queryRaw`
      SELECT "creatorId" FROM memberships 
      WHERE "userId" = ${userId} 
      AND role = 'owner'
      LIMIT 1
    `

    const membership = (memberships as any[])[0]
    if (!membership) return []

    // Get articles using raw SQL
    const articles = await prisma.$queryRaw`
      SELECT 
        a.id, a.title, a.slug, a."contentType", a.status, a.visibility, 
        a.tags, a.pricing, a."createdAt", a."publishedAt", a."currentArtifactId"
      FROM articles a
      WHERE a."creatorId" = ${membership.creatorId}
      ORDER BY a."createdAt" DESC
    `

    return (articles as any[]).map(article => ({
      ...article,
      tags: article.tags || [],
      pricing: article.pricing || {},
      createdAt: new Date(article.createdAt),
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
      currentArtifact: article.currentArtifactId ? { id: article.currentArtifactId } : undefined
    }))
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

async function ArticlesContent() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const articles = await getArticles(session.user.id)
  
  // Convert Date objects to strings and ensure tags is array for client component
  const clientArticles = articles.map(article => ({
    ...article,
    tags: Array.isArray(article.tags) ? article.tags : [],
    createdAt: article.createdAt.toISOString(),
    publishedAt: article.publishedAt?.toISOString() || null
  }))
  
  return <ArticlesClient articles={clientArticles} />
}

export default function ArticlesPage() {
  return (
    <AuthGuard>
      <ArticlesContent />
    </AuthGuard>
  )
}