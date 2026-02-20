import { Queue } from 'bullmq'

const connection = () => {
  const url = process.env.REDIS_URL
  if (!url) throw new Error('REDIS_URL not set')
  const { hostname, port, password } = new URL(url)
  return { host: hostname, port: Number(port), password }
}

export const webhookQueue = new Queue('webhook-events', { connection: connection() })
export const emailQueue = new Queue('emails', { connection: connection() })
