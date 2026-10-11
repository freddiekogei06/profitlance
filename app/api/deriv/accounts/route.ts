export async function GET(req: Request) {
  try {
    const auth = req.headers.get('authorization') || req.headers.get('Authorization')
    if (!auth) {
      return Response.json({ error: 'No Authorization header' }, { status: 401 })
    }
    const res = await fetch('https://api.deriv.com/api/v3/accounts', {
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    const text = await res.text()
    try {
      const json = JSON.parse(text)
      return Response.json(json, { status: res.status })
    } catch {
      return Response.json({ error: 'Deriv raw', raw: text.substring(0, 500) }, { status: res.status })
    }
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
