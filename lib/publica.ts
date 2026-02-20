import { PublicaContent, PublicaOrderRequest, PublicaOrderResponse } from '@/types'

export class PublicaClient {
  private baseUrl: string
  private apiToken: string
  private rateLimitRemaining = 60
  private rateLimitReset = Date.now() + 60000

  constructor(storeDomain: string, apiToken: string) {
    this.baseUrl = `https://${storeDomain}`
    this.apiToken = apiToken
  }

  async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (this.rateLimitRemaining <= 0) {
      const now = Date.now()
      if (now < this.rateLimitReset) {
        const waitTime = this.rateLimitReset - now
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)}s`)
      }
      this.rateLimitRemaining = 60
      this.rateLimitReset = now + 60000
    }

    const fullUrl = `${this.baseUrl}${endpoint}`
    console.log('Publica API request:', {
      url: fullUrl,
      method: options.method || 'GET',
      headers: {
        'X-User-Token': this.apiToken ? '***' + this.apiToken.slice(-4) : 'NOT_SET',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? 'Body present' : 'No body'
    })

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'X-User-Token': this.apiToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      redirect: 'follow',
    })

    console.log('Publica API response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      ok: response.ok
    })

    const remaining = response.headers.get('X-RateLimit-Remaining')
    const reset = response.headers.get('X-RateLimit-Reset')
    if (remaining) this.rateLimitRemaining = parseInt(remaining)
    if (reset) this.rateLimitReset = parseInt(reset) * 1000

    const raw = await response.text()
    console.log('Publica API response body:', raw.slice(0, 500))

    if (!response.ok) {
      throw new Error(`Publica API error: ${response.status} ${response.statusText} Body: ${raw.slice(0, 300)}`)
    }

    try {
      return JSON.parse(raw) as T
    } catch (e) {
      throw new Error(`Publica API returned non-JSON response. Body: ${raw.slice(0, 300)}`)
    }
  }

  async getContent(params: {
    include?: string
    fields?: string
    per_page?: number
    page?: number
  } = {}): Promise<{ data: PublicaContent[] }> {
    const searchParams = new URLSearchParams()
    if (params.include) searchParams.append('include', params.include)
    if (params.fields) searchParams.append('fields', params.fields)
    if (params.per_page) searchParams.append('per_page', params.per_page.toString())
    if (params.page) searchParams.append('page', params.page.toString())

    return this.makeRequest<{ data: PublicaContent[] }>(
      `/api/v3/content?${searchParams.toString()}`
    )
  }

  async createContent(data: {
    name: string
    publication_date: string
    extension: string
    file_url: string
    external_id: string
    prices?: { USD?: number; EUR?: number; ARS?: number }
    description?: string
    lang?: string
    author?: string[]
    bisac?: { code: string }[]
    publisher?: string[]
    keyword?: string[]
    free?: boolean
  }): Promise<{ id: string; external_id: string; reader_url: string }> {
    const payload = {
      name: data.name,
      publication_date: data.publication_date,
      extension: data.extension,
      file_url: data.file_url,
      external_id: data.external_id,
      prices: data.prices || { USD: 9.99 },
      description: data.description || `${data.name} - Published on Publica.now`,
      lang: data.lang || 'en',
      author: data.author || ['Publica.now Creator'],
      bisac: data.bisac || [{ code: 'SEL009000' }], // Default to Self-Help
      publisher: data.publisher || ['publica.la'],
      keyword: data.keyword || ['digital-content', 'publica-now'],
      free: typeof data.free === 'boolean' ? data.free : false,
    }

    const response = await this.makeRequest<{ 
      CODE: string; 
      data: { 
        issue: { 
          id: string; 
          external_id: string; 
          slug: string;
        } 
      } 
    }>(
      '/integration-api/v1/dashboard/issues',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    )

    // Extract the ID from the v1 API response structure
    const issueId = response.data?.issue?.id
    const externalId = response.data?.issue?.external_id || payload.external_id

    if (!issueId) {
      throw new Error('Invalid response from publica.la API - missing issue ID')
    }

    // Construct the reader URL based on the store domain and slug
    const readerUrl = `${this.baseUrl}/reader/${response.data.issue.slug || externalId}`

    return {
      id: issueId.toString(),
      external_id: externalId,
      reader_url: readerUrl
    }
  }

  async createOrder(orderData: PublicaOrderRequest): Promise<PublicaOrderResponse> {
    return this.makeRequest<PublicaOrderResponse>(
      '/integration-api/v1/orders',
      {
        method: 'POST',
        body: JSON.stringify(orderData),
      }
    )
  }

  async createPlan(data: {
    name: string
    type: 'recurring' | 'prepaid'
    price: number
    currency: string
    external_id: string
  }): Promise<{ id: string }> {
    return this.makeRequest<{ id: string }>(
      '/integration-api/v1/dashboard/plans',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  }

  async createUser(data: {
    email: string
    external_id: string
  }): Promise<{ id: string }> {
    return this.makeRequest<{ id: string }>(
      '/integration-api/v1/dashboard/users',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  }
}
