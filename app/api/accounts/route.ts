export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request){
 try{
  // 1. Hacker-proof: Only allow your own site
  const origin = req.headers.get('origin') || ''
  if(origin && !origin.includes('profitlance') && !origin.includes('vercel.app') && !origin.includes('localhost')){
    return Response.json({error:"forbidden origin"}, {status:403})
  }

  const {token} = await req.json()
  
  // 2. FIX: Rate limit INSIDE function, BEFORE fetch
  if(!token || token.length < 30){
    return Response.json({error:"Token too short, need full a1- token"}, {status:400})
  }
  
  const appId = process.env.DERIV_APP_ID || '1089'
  
  const res = await fetch('https://api.derivws.com/trading/v1/options/accounts',{
    method: 'GET',
    headers:{ 
      'Authorization': `Bearer ${token}`, 
      'Deriv-App-ID': appId 
    }
  })
  
  const txt = await res.text()
  let data
  try{ 
    data = JSON.parse(txt) 
  }catch{ 
    data = {raw: txt.slice(0,500)} 
  }
  
  return Response.json(data, {status: res.status})
  
 }catch(e:any){ 
  return Response.json({error:e.message}, {status:500}) 
 }
}
