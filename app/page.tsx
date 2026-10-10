"use client";
import { useState, useEffect, useRef } from "react";
const APP_ID="1089";
export default function Page(){
 const [token,setToken]=useState("");
  const [bal,setBal]=useState(0);
   const [log,setLog]=useState<string[]>([]);
    const [price,setPrice]=useState(0);
     const ws=useRef<WebSocket|null>(null);
      const add=(m:string)=>setLog(p=>[m,...p].slice(0,80));
       useEffect(()=>{
         const w=new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);
           ws.current=w;
             w.onopen=()=>{add("WS OPEN"); w.send(JSON.stringify({ticks:"R_75"}))};
               w.onmessage=(e)=>{
                  const d=JSON.parse(e.data);
                     if(d.tick) setPrice(d.tick.quote);
                        if(d.authorize){ setBal(d.authorize.balance); add(`OK BAL $${d.authorize.balance} ${d.authorize.loginid}`) }
                           if(d.buy) add(`BOUGHT ${d.buy.contract_id} $${d.buy.buy_price}`);
                              if(d.error) add(`ERR ${d.error.code} ${d.error.message}`);
                                };
                                  return()=>w.close();
                                   },[]);
                                    const connect=()=>{
                                      const t=token.trim(); if(!t) return;
                                        add(`CONNECTING ${t.slice(0,8)}...`);
                                          if(t.startsWith("pat_")){
                                             fetch("https://api.deriv.com/api/account/info",{headers:{Authorization:`Bearer ${t}`}})
                                                 .then(r=>r.json()).then(j=>{
                                                      const b=j?.data?.balance ?? 0;
                                                           if(b) setBal(b);
                                                                add(`PAT REST BAL $${b}`);
                                                                     ws.current?.send(JSON.stringify({authorize:t}));
                                                                         }).catch(()=>{
                                                                              add("PAT REST fail, trying WS auth directly");
                                                                                   ws.current?.send(JSON.stringify({authorize:t}));
                                                                                       });
                                                                                         } else {
                                                                                            ws.current?.send(JSON.stringify({authorize:t}));
                                                                                              }
                                                                                               };
                                                                                                const buy=(dir:string)=>{
                                                                                                  const type=dir==="up"?"CALL":"PUT";
                                                                                                    ws.current?.send(JSON.stringify({buy:1,price:1,parameters:{amount:1,basis:"stake",contract_type:type,currency:"USD",duration:5,duration_unit:"t",symbol:"R_75"}}));
                                                                                                      add(`BUY ${dir} ${type}`);
                                                                                                       };
                                                                                                        return (
                                                                                                          <div style={{padding:12,background:"#000",color:"#0f0",minHeight:"100vh",fontFamily:"monospace"}}>
                                                                                                             <h2 style={{color:"#0ff"}}>PROFITLANCE PAT+REAL R_75 {price}</h2>
                                                                                                                <input value={token} onChange={e=>setToken(e.target.value)} placeholder="paste pat_ or a1- token full" style={{width:"100%",padding:10,background:"#111",color:"#0f0",border:"1px solid #0f0"}}/>
                                                                                                                   <div style={{display:"flex",gap:8,marginTop:10}}>
                                                                                                                       <button onClick={connect} style={{flex:1,padding:12,background:"#00aa00",color:"#fff",fontWeight:"bold"}}>CONNECT REAL</button>
                                                                                                                           <div style={{padding:12,border:"1px solid #0f0"}}>BAL ${bal}</div>
                                                                                                                              </div>
                                                                                                                                 <div style={{display:"flex",gap:8,marginTop:12}}>
                                                                                                                                     <button onClick={()=>buy("up")} style={{flex:1,padding:22,background:"green",color:"#fff",fontSize:20,fontWeight:"bold"}}>BUY UP x200</button>
                                                                                                                                         <button onClick={()=>buy("down")} style={{flex:1,padding:22,background:"red",color:"#fff",fontSize:20,fontWeight:"bold"}}>SELL DOWN x200</button>
                                                                                                                                            </div>
                                                                                                                                               <div style={{marginTop:12,fontSize:12}}>{log.map((l,i)=><div key={i}>{l}</div>)}</div>
                                                                                                                                                 </div>
                                                                                                                                                  )
                                                                                                                                                  }