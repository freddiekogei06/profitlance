export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function POST(req: Request){
  const {token, accountId} = await req.json()
  const res = await fetch(`https://api.derivws.com/trading/v1/options/accounts/${accountId}/otp`,{
    method:'POST',
    headers:{ 'Authorization':`Bearer ${token}` }
  })
  const data = await res.json()
  return Response.json(data,{status: res.status})
}
