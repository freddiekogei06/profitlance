export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function POST(req: Request){
  const {token} = await req.json()
  const res = await fetch('https://api.derivws.com/trading/v1/options/accounts',{
    headers:{ 'Authorization':`Bearer ${token}` }
  })
  const data = await res.json()
  return Response.json(data,{status: res.status})
}
export async function GET(req: Request){
  const auth = req.headers.get('authorization')!
  const res = await fetch('https://api.derivws.com/trading/v1/options/accounts',{
    headers:{ 'Authorization': auth }
  })
  const data = await res.json()
  return Response.json(data,{status: res.status})
}
