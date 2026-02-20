export interface PublicaContent {
  id: string
  name: string
  cover_url?: string
  reader_url?: string
  product_url?: string
  free: {
    enabled: boolean
    until?: string
  }
  preview: {
    enabled: boolean
  }
  prices?: {
    USD?: number
    EUR?: number
  }
  description?: string
}

export interface PublicaOrderRequest {
  type: 'sale' | 'report' | 'permission'
  external_reference: string
  return_url: string
  unit_price: number
  currency_id: string
  user: {
    id: string
    email: string
  }
  products: Array<{
    id: string
    type: 'content' | 'subscription'
    name: string
    url?: string
  }>
}

export interface PublicaOrderResponse {
  id: string
  checkout: {
    url: string
  }
  status: string
}

export interface PublicaWebhookPayload {
  token: string
}

export interface PublicaWebhookEvent {
  iss: string
  aud: string
  exp: number
  iat: number
  event_type: string
  data: any
}

export interface CreatorBranding {
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
  logo?: string
}

export interface PostPricing {
  USD?: number
  EUR?: number
}

export type PostVisibility = 'free' | 'paid' | 'subscribers'
export type PostKind = 'pdf' | 'epub' | 'audio'
export type PlanType = 'recurring' | 'prepaid'
export type OrderType = 'sale' | 'report' | 'permission'
export type OrderStatus = 'pending' | 'approved' | 'failed'
export type MembershipRole = 'owner' | 'editor' | 'reader'
