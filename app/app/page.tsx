"use client"
import { useEffect, useRef, useState } from 'react'

export default function Page(){
  const [price,setPrice]=useState(0)
  const [prices,setPrices]=useState<number[]>([])
  const [balance,setBalance]=useState('0')
  const [token,setToken]=useState('a1Brw2yXb7Q5o9c')
  const [connected,setConnected]=useState(false)
  const [log,setLog]=useState<string[]>([])
  const [openTrade,setOpenTrade]=useState<any>(null)
  const [profit,setProfit]=useState(0)
  const ws=useRef<WebSocket|null>(null)
  const entry=useRef(0)

  const addLog=(m:string)=>setLog(l=>[`${new Date().toLocaleTimeString()} ${m}`,...l].slice(0,20))

  useEffect(()=>{
    const t=localStorage.getItem('deriv_token')
    if(t) setToken(t)
    const w=new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089')
    ws.current=w
    w.onopen=()=>{
      setConnected(true)
      addLog('Connected to Deriv WS')
      w.send(JSON.stringify({ticks:'R_75'}))
      if(token) auth(token)
    }
    w.onmessage=(e)=>{
      const d=JSON.parse(e.data)
      if(d.tick){
        const p=parseFloat(d.tick.quote)
        setPrice(p)
        setPrices(prev=>[...prev.slice(-49),p])
        if(openTrade){
          const diff=openTrade.type==='CALL'?p-entry.current:entry.current-p
          setProfit(diff*200)
        }
      }
      if(d.authorize){
        setBalance(d.authorize.balance.toString())
        addLog(`Auth OK Balance $${d.authorize.balance}`)
      }
      if(d.buy){
        addLog(`BUY OK id ${d.buy.contract_id} entry ${d.buy.entry_spot}`)
        entry.current=d.buy.entry_spot
        setOpenTrade({id:d.buy.contract_id,type:d.buy.contract_type,buy_price:1})
        ws.current?.send(JSON.stringify({proposal_open_contract:1,contract_id:d.buy.contract_id}))
      }
      if(d.proposal_open_contract){
        if(d.proposal_open_contract.is_sold){
          addLog(`CLOSED Profit $${d.proposal_open_contract.profit}`)
          setOpenTrade(null); setProfit(0)
          ws.current?.send(JSON.stringify({balance:1}))
        }else{
          if(d.proposal_open_contract.current_spot){
            const cur=d.proposal_open_contract.current_spot
            const diff=d.proposal_open_contract.contract_type==='CALL'?cur-entry.current:entry.current-cur
            setProfit(diff*200)
          }
        }
      }
      if(d.balance) setBalance(d.balance.balance.toString())
      if(d.error) addLog('ERR '+d.error.message)
    }
  },[])

  const auth=(tk:string)=>{
    localStorage.setItem('deriv_token',tk)
    ws.current?.send(JSON.stringify({authorize:tk}))
    ws.current?.send(JSON.stringify({balance:1}))
  }

  const buy=(type:'CALL'|'PUT')=>{
    if(!openTrade){
      addLog(`Buying ${type} $1 x200 R_75`)
      ws.current?.send(JSON.stringify({buy:1,price:1,parameters:{amount:1,basis:'stake',contract_type:type,currency:'USD',symbol:'R_75',multiplier:200}}))
    }
  }
  const close=()=>{
    if(openTrade) ws.current?.send(JSON.stringify({sell:openTrade.id,price:0}))
  }

  return(
    <div style={{fontFamily:'monospace',color:'#00ff88',padding:12,background:'#000',minHeight:'100vh'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 style={{margin:0}}>PROFITLANCE • R_75 REAL</h2>
        <div style={{background: connected?'#00ff88':'#ff0000',color:'#000',padding:'4px 8px',borderRadius:4}}>{connected?'LIVE':'OFFLINE'}</div>
      </div>

      <div style={{marginTop:12,border:'1px solid #222',padding:10,borderRadius:8}}>
        <div>Token: <input value={token} onChange={e=>setToken(e.target.value)} style={{width:180,background:'#111',color:'#0f0',border:'1px solid #333'}} />
        <button onClick={()=>auth(token)} style={{marginLeft:8,background:'#00ff88',color:'#000',border:0,padding:'4px 8px'}}>CONNECT</button>
        <span style={{marginLeft:12}}>Balance: ${balance}</span></div>
      </div>

      <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div style={{border:'1px solid #222',padding:12,borderRadius:8}}>
          <div style={{fontSize:32}}>{price.toFixed(4)}</div>
          <div style={{height:80,display:'flex',alignItems:'flex-end',gap:1,marginTop:8}}>
            {prices.map((p,i)=>{const min=Math.min(...prices); const max=Math.max(...prices); const h=max===min?40:((p-min)/(max-min))*70+5; return <div key={i} style={{flex:1,height:h,background:prices[0]&&p>prices[0]?'#00ff88':'#ff4444'}}/>})}
          </div>
          <div style={{marginTop:12,display:'flex',gap:8}}>
            <button onClick={()=>buy('CALL')} disabled={!!openTrade} style={{flex:1,background:openTrade?'#333':'#00ff88',color:openTrade?'#777':'#000',padding:14,fontWeight:900,border:0,borderRadius:6}}>BUY UP x200</button>
            <button onClick={()=>buy('PUT')} disabled={!!openTrade} style={{flex:1,background:openTrade?'#333':'#ff4444',color:openTrade?'#777':'#fff',padding:14,fontWeight:900,border:0,borderRadius:6}}>SELL DOWN x200</button>
          </div>
          {openTrade&&<div style={{marginTop:10,padding:10,background:'#111',borderRadius:6}}>
            <div>OPEN: {openTrade.type} Entry {entry.current}</div>
            <div style={{fontSize:22,color:profit>=0?'#00ff88':'#ff4444'}}>P/L ${profit.toFixed(2)}</div>
            <button onClick={close} style={{marginTop:8,width:'100%',background:'#fff',color:'#000',padding:10,border:0,borderRadius:6,fontWeight:900}}>CLOSE TRADE</button>
          </div>}
        </div>
        <div style={{border:'1px solid #222',padding:10,borderRadius:8,maxHeight:300,overflow:'auto'}}>
          <div>LOG</div>
          {log.map((l,i)=><div key={i} style={{fontSize:11,borderBottom:'1px solid #111',padding:'2px 0'}}>{l}</div>)}
        </div>
      </div>
      <div style={{marginTop:12,fontSize:11,color:'#666'}}>Stake $1 Multiplier 200 = Real Deriv trade. Uses your token a1Brw... Profit = tick diff *200. Close anytime.</div>
    </div>
  )
          }
