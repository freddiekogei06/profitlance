// @ts-nocheck
export async function POST(req:Request){
  try{
    const {token}=await req.json();
    const r=await fetch("https://api.deriv.com/trading/v1/options/accounts",{
      headers:{ "Authorization": `Bearer ${token}`, "Content-Type":"application/json" }
    });
    const data=await r.json();
    if(!r.ok) return new Response(JSON.stringify({error: JSON.stringify(data)}),{status:r.status});
    return new Response(JSON.stringify(data),{status:200});
  }catch(e:any){ return new Response(JSON.stringify({error:e.message}),{status:500}); }
}
