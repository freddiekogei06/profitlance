// @ts-nocheck
"use client";
import { useRef, useState } from "react";

export default function Page(){
  const [token,setToken]=useState("");
  const [logs,setLogs]=useState(["Ready"]);
  const [bal,setBal]=useState(0);
  const [ok,setOk]=useState(false);
  const ws=useRef(null);
  const add=(m)=>setLogs(p=>[...p.slice(-80), m]);

  const connect=()=>{
    const t=token.trim().replace(/\s+/g,"");
    if(!t){ add("Paste token"); return; }
    add("len "+t.length+" -> "+t.slice(0,10));
    if(t.length<30){ add("TOO SHORT! You copied only part. Full token is 100+ chars. Use COPY button on Deriv."); return; }

    const urls=[
      "wss://ws.derivws.com/websockets/v3?app_id=1089",
      "wss://ws.binaryws.com/websockets/v3?app_id=1089",
      "wss://ws.derivws.com/websockets/v3?app_id=1169"
    ];
    let i=0;
    const go=()=>{
      if(i>=urls.length) return;
      const url=urls[i++];
      add("Trying "+url);
      if(ws.current) try{ws.current.close()}catch{}
      const w=new WebSocket(url);
      ws.current=w;
      w.onopen=()=>{ add("OPEN "+url); w.send(JSON.stringify({authorize:t})); };
      w.onmessage=(e)=>{
        add("MSG "+e.data.substring(0,180));
        try{
          const d=JSON.parse(e.data);
          if(d.error){ add("ERR "+d.error.code+": "+d.error.message); return; }
          if(d.msg_type==="authorize"){ add("AUTHORIZED "+d.authorize.loginid); setOk(true); setBal(Number(d.authorize.balance)); w.send(JSON.stringify({balance:1,subscribe:1})); }
          if(d.msg_type==="balance") setBal(Number(d.balance.balance));
        }catch{}
      };
      w.onerror=()=>{ add("WS ERROR "+url); };
      w.onclose=(ev)=>{ add("CLOSED code="+ev.code+" reason="+(ev.reason||"none")); if(ev.code!==1000 && i<urls.length) setTimeout(go,800); };
    };
    go();
  };

  const buy=(dir)=>{
    if(!ws.current) return;
    ws.current.send(JSON.stringify({buy:1,price:1,parameters:{amount:1,basis:"stake",contract_type:dir,currency:"USD",duration:5,duration_unit:"t",symbol:"R_75"}}));
    add("BUY "+dir);
  };

  return (
    <div style={{background:"#000",color:"#fff",padding:12,minHeight:"100vh",fontFamily:"monospace"}}>
      <h3>PROFITLANCE v3 FIX</h3>
      <textarea value={token} onChange={e=>setToken(e.target.value)} placeholder="Paste FULL token here - 100+ chars" style={{width:"100%",height:70,background:"#111",color:"#0f0",padding:8}} />
      <div>len {token.trim().length}</div>
      <button onClick={connect} style={{width:"100%",padding:12,marginTop:8,background:ok?"#0a0":"#0f0",fontWeight:"bold"}}>{ok?"BAL $"+bal.toFixed(2)+" REAL":"CONNECT REAL"}</button>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button onClick={()=>buy("CALL")} style={{flex:1,padding:14,background:"#0f0"}}>BUY UP</button>
        <button onClick={()=>buy("PUT")} style={{flex:1,padding:14,background:"#f00",color:"#fff"}}>SELL DOWN</button>
      </div>
      <div style={{marginTop:8}}>BAL ${bal.toFixed(2)} {ok?"REAL":"DEMO"}</div>
      <div style={{background:"#111",marginTop:10,padding:8,height:280,overflow:"auto",fontSize:11}}>{logs.map((l,idx)=><div key={idx} style={{borderBottom:"1px solid #222"}}>{l}</div>)}</div>
    </div>
  );
                                                                                                                                               }
