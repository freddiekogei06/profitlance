export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()
    if (!token) return Response.json({error:'No token'}, {status:400})
    const appId = process.env.DERIV_APP_ID || '116370'
    const res = await fetch('https://api.derivws.com/trading/v1/options/accounts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Deriv-App-ID': appId,
        'Content-Type': 'application/json'
      }
    })
    const text = await res.text()
    try {
      const data = JSON.parse(text)
      return Response.json(data, {status: res.status})
    } catch {
      return Response.json({error: text.slice(0,500), status: res.status}, {status: res.status})
    }
  } catch(e:any){
    return Response.json({error: e.message}, {status:500})
  }
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (!auth) return Response.json({error:'No auth'}, {status:400})
  const appId = process.env.DERIV_APP_ID || '116370'
  const res = await fetch('https://api.derivws.com/trading/v1/options/accounts', {
    headers: { 'Authorization': auth, 'Deriv-App-ID': appId }
  })
  const data = await res.json()
  return Response.json(data, {status: res.status})
}
