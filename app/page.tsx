"use client"
import { useState, useEffect, useRef } from "react"
export default function Page(){
  const [price,setPrice]=useState(0)
    const [balance,setBalance]=useState('0')
      const [token,setToken]=useState('a1Brw2yXb7Q5o9c')
        const ws=useRef<any>(null)
          const [log,setLog]=useState<string[]>([])
            useEffect(()=>{
                const w=new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089')
                    ws.current=w
                        w.onopen=()=>{setLog(l=>['WS OPEN',...l]); w.send(JSON.stringify({ticks:'R_75'}))}
                            w.onmessage=(e)=>{const d=JSON.parse(e.data); if(d.tick){setPrice(d.tick.quote)} if(d.authorize){setBalance(d.authorize.balance)} if(d.buy){setLog(l=>[`BOUGHT ${d.buy.contract_id} $1`,...l])}}
                              },[])
                                const auth=(tk:string)=>{ws.current.send(JSON.stringify({authorize:tk})); setLog(l=>[`AUTH ${tk.slice(0,6)}...`,...l])}
                                  const buy=(t:string)=>{ws.current.send(JSON.stringify({buy:1,price:1,parameters:{amount:1,basis:'stake',contract_type:t,currency:'USD',duration:5,duration_unit:'t',symbol:'R_75'}}))}
                                    return <div style={{background:'#000',color:'#0f0',minHeight:'100vh',padding:20,fontFamily:'monospace'}}>
                                        <h1>PROFITLANCE LIVE R_75 {price}</h1>
                                            <p>Balance: {balance}</p>
                                                <input value={token} onChange={e=>setToken(e.target.value)} style={{background:'#111',color:'#0f0',border:'1px solid #0f0',padding:8,width:'100%'}}/>
                                                    <div style={{display:'flex',gap:10,marginTop:15}}>
                                                          <button onClick={()=>auth(token)} style={{flex:1,padding:15,background:'#0f0',color:'#000',fontWeight:'bold'}}>CONNECT</button>
                                                                <button onClick={()=>buy('CALL')} style={{flex:1,padding:15,background:'#0a0',color:'#fff',fontWeight:'bold'}}>BUY UP x200</button>
                                                                      <button onClick={()=>buy('PUT')} style={{flex:1,padding:15,background:'#a00',color:'#fff',fontWeight:'bold'}}>SELL DOWN x200</button>
                                                                          </div>
                                                                              <div style={{marginTop:20,borderTop:'1px solid #333',paddingTop:10}}>{log.map((l,i)=><div key={i}>{l}</div>)}</div>
                                                                                </div>
                                                                                }