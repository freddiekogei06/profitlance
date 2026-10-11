"use client";
import { useRef, useState } from "react";

const ENDPOINTS = [
  "wss://ws.derivws.com/websockets/v3?app_id=1089",
  "wss://ws.binaryws.com/websockets/v3?app_id=1089",
  "wss://ws.derivws.com/websockets/v3?app_id=1169",
];

export default function Page(){
  const [token,setToken]=useState("");
  const [logs,setLogs]=useState(["Ready - paste FULL token incl pat_ prefix"]);
  const [bal,setBal]=useState(0);
  const [ok,setOk]=useState(false);
  const ws=useRef<WebSocket|null>(null);
  const add=(m:string)=>setLogs(p=>[...p.slice(-100), `${new Date().toLocaleTimeString()} ${m}`]);

  const connect=()=>{
    const t=token.trim().replace(/\s+/g,"");
    if(!t){ add("❌ Empty token"); return; }
    if(t.length < 20){ add(`❌ Token too short: ${t.length} chars - you copied only part! Need full 100+ chars`); return; }
    add(`Token len ${t.length} start ${t.slice(0,8)}...`);
    
    // try endpoints one by one
    let idx=0;
    const tryConnect=()=>{
      if(idx>=ENDPOINTS.length){ add("❌ All endpoints failed"); return; }
      const url=ENDPOINTS[idx++];
      add(`Trying ${url}`);
      if(ws.current) try{ws.current.close()}catch{}
      const w=new WebSocket(url);
      ws.current=w;
      let opened=false;
      w.onopen=()=>{
        opened=true;
        add(`✅ WS OPEN ${url}`);
        add(`Sending authorize ${t.slice(0,8)}...`);
        w.send(JSON.stringify({authorize:t}));
      };
      w.onmessage=(e)=>{
        add(`MSG: ${e.data.slice(0,200)}`);
        try{
          const d=JSON.parse(e.data);
          if(d.error){ add(`❌ DERIV ERROR: ${d.error.code} - ${d.error.message}`); if(d.error.code==="InvalidToken"){ add("-> Token invalid/expired. Create NEW a1- token at app.deriv.com/account/api-token"); } return; }
          if(d.msg_type==="authorize"){
            add(`🎉 AUTHORIZED ${d.authorize.loginid} BAL ${d.authorize.balance}`);
            setOk(true); setBal(d.authorize.balance);
            w.send(JSON.stringify({balance:1,subscribe:1}));
          }
          if(d.msg_type==="balance") setBal(d.balance.balance);
        }catch{}
      };
      w.onerror=(ev)=>{ add(`⚠️ WS ERROR on ${url} - ${(ev as any).type || "unknown"}`); };
      w.onclose=(ev)=>{
        add(`🔴 CLOSED code=${ev.code} reason=${ev.reason || "none"} wasClean=${ev.wasClean} opened=${opened}`);
        if(!opened && idx<ENDPOINTS.length){ add("Retrying next endpoint in 1s..."); setTimeout(tryConnect,1000); }
        else if(!opened) setOk(false);
      };
    };
    tryConnect();
  };

  const buy=(dir:string)=>{
    if(!ws.current) return;
    ws.current.send(JSON.stringify({buy:1,price:1,parameters:{amount:1,basis:"stake",contract_type:dir,currency:"USD",duration:5,duration_unit:"t",symbol:"R_75"}}));
    add(`BUY ${dir}`);
  };

  return(
    <div style={{background:"#000",color:"#fff",padding:12,minHeight:"100vh",fontFamily:"monospace"}}>
      <h3>PROFITLANCE DEBUG v2</h3>
      <textarea value={token} onChange={e=>setToken(e.target.value)} placeholder="PASTE FULL pat_... or a1-... token here (must be 100+ chars)" style={{width:"100%",height:80,padding:10,background:"#111",color:"#0f0",border:"1px solid #333"}}/>
      <div style={{fontSize:11,color:"#888"}}>len: {token.trim().length} chars</div>
      <button onClick={connect} style={{width:"100%",padding:14,marginTop:8,background: ok ? "#0a0" : "#0f0",fontWeight:"bold",fontSize:16}}>{ok ? `BAL $${bal.toFixed(2)} REAL` : "CONNECT REAL - TEST 3 SERVERS"}</button>
      <div style={{display:"flex",gap:8,marginTop:8}}><button onClick={()=>buy("CALL")} style={{flex:1,padding:15,background:"#0f0"}}>BUY UP</button><button onClick={()=>buy("PUT")} style={{flex:1,padding:15,background:"#f00",color:"#fff"}}>SELL DOWN</button></div>
      <div style={{marginTop:6}}>BAL ${bal.toFixed(2)} {ok?"REAL ✅":"DEMO"}</div>
      <div style={{background:"#111",marginTop:10,padding:8,height:300,overflow:"auto",fontSize:11,whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{logs.map((l,i)=><div key={i} style={{borderBottom:"1px solid #222",padding:"2px 0"}}>{l}</div>)}</div>
      <div style={{marginTop:10,fontSize:11,color:"#aaa"}}>If you see InvalidToken -> go to app.deriv.com/account/api-token and create a1- token (not PAT). a1- works 100%.</div>
    </div>
  );
      }
