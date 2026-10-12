export const dynamic='force-dynamic'
export const runtime='nodejs'
export async function POST(req: Request){
 const {token, accountId}=await req.json()
 const appId=process.env.DERIV_APP_ID || '1089'
 const res=await fetch(`https://api.derivws.com/trading/v1/options/accounts/${accountId}/otp`,{
  method:'POST',
  headers:{ 'Authorization':`Bearer ${token}`, 'Deriv-App-ID': appId }
 })
 const txt=await res.text()
 let data; try{data=JSON.parse(txt)}catch{data={raw:txt}}
 return Response.json(data,{status: res.status})
}
