export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const appId = process.env.DERIV_APP_ID || ''

  if (!auth) {
    return Response.json({ error: 'No Authorization header' }, { status: 401 })
  }
  if (!appId) {
    return Response.json({ error: 'Missing DERIV_APP_ID env var - add in Vercel Settings' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.derivws.com/trading/v1/options/accounts', {
      headers: {
        'Authorization': auth,
        'Deriv-App-ID': appId,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })
    const text = await res.text()
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
