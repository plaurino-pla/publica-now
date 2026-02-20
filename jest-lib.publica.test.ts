import { PublicaClient } from '@/lib/publica'

describe('PublicaClient', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
      headers: new Map([
        ['X-RateLimit-Remaining', '59'],
        ['X-RateLimit-Reset', `${Math.floor(Date.now()/1000) + 60}`],
      ]),
    })
  })

  it('builds content v3 URL with params', async () => {
    const client = new PublicaClient('demo.publica.la', 'token')
    await client.getContent({ include: 'prices', fields: 'id', per_page: 10, page: 2 })
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://demo.publica.la/api/v3/content?'),
      expect.any(Object)
    )
  })
})
