export const dynamic='force-dynamic'
export const runtime='nodejs'
export async function POST(req: Request){
 try{
  const {token}=await req.json()
  const appId=process.env.DERIV_APP_ID || '1089'
  const res=await fetch('https://api.derivws.com/trading/v1/options/accounts',{
   headers:{ 'Authorization':`Bearer ${token}`, 'Deriv-App-ID': appId }
  })
  const txt=await res.text()
  let data
  try{ data=JSON.parse(txt) }catch{ data={raw:txt.slice(0,500)} }
  return Response.json(data,{status: res.status})
 }catch(e:any){ return Response.json({error:e.message},{status:500}) }
}
// Rate limit - block spam
if(token.length < 30) return Response.json({error:"invalid"}, {status:400})
