export class CloudflareStreamClient {
  private accountId: string
  private apiToken: string

  constructor(accountId: string, apiToken: string) {
    this.accountId = accountId
    this.apiToken = apiToken
  }

  async createDirectUpload(params: {
    maxDurationSeconds?: number
    webhookUrl?: string
    allowedOrigins?: string[]
    requireSignedURLs?: boolean
    creator?: string
    metadata?: Record<string, any>
  }): Promise<{ uploadURL: string; uid: string }> {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/direct_upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        maxDurationSeconds: params.maxDurationSeconds ?? 3600,
        requireSignedURLs: params.requireSignedURLs ?? false,
        allowedOrigins: params.allowedOrigins,
        creator: params.creator,
        webhookUrl: params.webhookUrl,
        meta: params.metadata,
      })
    })
    const json: any = await res.json()
    if (!res.ok || !json?.success) {
      throw new Error(`Cloudflare direct upload failed: ${res.status} ${JSON.stringify(json)}`)
    }
    return { uploadURL: json.result.uploadURL, uid: json.result.uid }
  }

  async getVideo(uid: string): Promise<any> {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${uid}`, {
      headers: { 'Authorization': `Bearer ${this.apiToken}` }
    })
    const json: any = await res.json()
    if (!res.ok || !json?.success) {
      throw new Error(`Cloudflare get video failed: ${res.status} ${JSON.stringify(json)}`)
    }
    return json.result
  }

  async updateVideo(uid: string, payload: { allowedOrigins?: string[]; requireSignedURLs?: boolean }): Promise<any> {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${uid}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    const json: any = await res.json()
    if (!res.ok || !json?.success) {
      throw new Error(`Cloudflare update video failed: ${res.status} ${JSON.stringify(json)}`)
    }
    return json.result
  }
}


