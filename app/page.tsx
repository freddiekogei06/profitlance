"use client"
import { useState, useEffect, useRef } from 'react'
export default function Page(){
  const [price,setPrice]=useState(0)
  const [balance,setBalance]=useState('0')
  const [token,setToken]=useState('a1Brw2yXb7Q5o9c')
  const ws=useRef<any>(null)
  const [log,setLog]=useState<string[]>([])
  useEffect(()=>{
    const w=new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089')
    ws.current=w
    w.onopen=()=>{setLog(l=>['WS OPEN',...l]); w.send(JSON.stringify({ticks:'R_75'})); if(token) auth(token)}
    w.onmessage=(e)=>{const d=JSON.parse(e.data); if(d.tick) setPrice(d.tick.quote); if(d.authorize) {setBalance(d.authorize.balance); setLog(l=>[`BAL ${d.authorize.balance}`,...l])} if(d.buy) setLog(l=>[`BUY ${d.buy.contract_id}`,...l])}
  },[])
  const auth=(tk:string)=>{ws.current.send(JSON.stringify({authorize:tk})); ws.current.send(JSON.stringify({balance:1}))}
  const buy=(t:string)=>{ws.current.send(JSON.stringify({buy:1,price:1,parameters:{amount:1,basis:'stake',contract_type:t,currency:'USD',symbol:'R_75',multiplier:200}}))}
  return <div style={{background:'#000',color:'#0f0',padding:10,fontFamily:'monospace'}}><h2>PROFITLANCE LIVE R_75 {price}</h2><div>Balance {balance} <input value={token} onChange={e=>setToken(e.target.value)} style={{background:'#111',color:'#0f0'}}/><button onClick={()=>auth(token)}>CONNECT</button></div><button onClick={()=>buy('CALL')} style={{background:'#0f0',padding:10,margin:5}}>BUY UP x200</button><button onClick={()=>buy('PUT')} style={{background:'#f44',padding:10}}>SELL DOWN x200</button><div>{log.map((l,i)=><div key={i}>{l}</div>)}</div></div>
}
