function detectContentType(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.epub')) return 'application/epub+zip'
  if (lower.endsWith('.mp3')) return 'audio/mpeg'
  if (lower.endsWith('.wav')) return 'audio/wav'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.webp')) return 'image/webp'
  return 'application/octet-stream'
}

export async function uploadBufferToTempService(filename: string, buffer: Buffer): Promise<string> {
  const contentType = detectContentType(filename)

  // 1) Prefer transfer.sh (simple PUT, returns plain URL)
  try {
    const put = await fetch(`https://transfer.sh/${encodeURIComponent(filename)}`, {
      method: 'PUT',
      body: buffer as any,
      headers: { 'Content-Type': contentType },
    })
    const text = (await put.text()).trim()
    if (put.ok && /^https?:\/\//.test(text)) {
      return text
    }
  } catch (_) {}

  // 1.25) If Vercel Blob token present, upload to Vercel Blob and return public URL
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import('@vercel/blob')
      const key = `publica-lite/${Date.now()}-${filename}`
      const res = await put(key, buffer as any, { access: 'public', contentType })
      if (res?.url) return res.url
    } catch (_) {}
  }

  // 1.5) If S3 env present, upload to S3 and return public or signed URL
  if (process.env.S3_BUCKET && process.env.S3_REGION && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      }
    })
    const key = `publica-lite/${Date.now()}-${filename}`
    await client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer as any,
      ContentType: contentType,
      ACL: 'public-read',
    }))
    const base = process.env.S3_PUBLIC_BASE_URL || `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`
    return `${base}/${key}`
  }

  // 2) Fallback to file.io multipart upload
  try {
    const form = new FormData()
    const blob = new Blob([buffer as any])
    form.append('file', blob, filename)
    const res = await fetch('https://file.io/?expires=1w', { method: 'POST', body: form as any })
    const raw = await res.text()
    let json: any = {}
    try { json = JSON.parse(raw) } catch {}
    const link = json?.link || json?.data?.link
    if (res.ok && link) return link as string
    throw new Error(`file.io response: ${raw.slice(0, 300)}`)
  } catch (e: any) {
    throw new Error(`temp upload failed: ${e.message}`)
  }
}
