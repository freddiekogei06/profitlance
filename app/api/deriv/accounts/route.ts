export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || ''
  if (!auth) {
    return new Response(JSON.stringify({ error: 'No auth' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }
  try {
    const res = await fetch('https://api.deriv.com/api/v3/accounts', {
      headers: { 'Authorization': auth, 'Accept': 'application/json' },
      cache: 'no-store'
    })
    const body = await res.text()
    // Always return JSON so frontend never gets "Unexpected end"
    return new Response(JSON.stringify({
      deriv_status: res.status,
      deriv_ok: res.ok,
      deriv_body_preview: body.substring(0, 2000),
      token_preview: auth.substring(0, 15)
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'fetch failed', message: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
