// @ts-nocheck
"use client";
import { useState, useRef } from "react";

export default function Page(){
  const [token,setToken]=useState("");
  const [logs,setLogs]=useState(["Paste your pat_ token (68 chars)"]);
  const [bal,setBal]=useState("0.00");
  const [ok,setOk]=useState(false);
  const wsRef=useRef(null);
  const add=(m)=>setLogs(p=>[...p.slice(-100), new Date().toLocaleTimeString()+" "+m]);

  const connectNewAPI=async()=>{
    const t=token.trim();
    if(t.length<60){ add("❌ Token too short, need full 68 chars with pat_"); return; }
    add("Step1: Getting accounts with Bearer "+t.slice(0,10)+"...");
    try{
      const r=await fetch("/api/deriv/accounts",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({token:t})
      });
      const data=await r.json();
      add("Accounts API: "+JSON.stringify(data).slice(0,300));
      if(!r.ok){ add("❌ Accounts failed: "+data.error); return; }

      const acc=data.accounts?.[0] || data[0];
      if(!acc){ add("❌ No accounts found, use Real account PAT"); return; }
      const accId=acc.id || acc.account_id;
      add("Found account "+accId+" balance "+acc.balance);

      add("Step2: Getting OTP for "+accId+"...");
      const r2=await fetch("/api/deriv/otp",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({token:t, accountId:accId})
      });
      const otpData=await r2.json();
      add("OTP API: "+JSON.stringify(otpData).slice(0,300));
      if(!r2.ok){ add("❌ OTP failed: "+otpData.error); return; }

      const wsUrl=otpData.ws_url || otpData.url || otpData.otp_url;
      if(!wsUrl){ add("❌ No ws_url in OTP response"); return; }

      add("Step3: Connecting to "+wsUrl.slice(0,60)+"...");
      const ws=new WebSocket(wsUrl);
      wsRef.current=ws;
      ws.onopen=()=>{ add("✅ WS OPEN - REAL CONNECTED!"); setOk(true); setBal(acc.balance?.toString()||"0"); ws.send(JSON.stringify({balance:1,subscribe:1})); };
      ws.onmessage=(e)=>{
        add("MSG "+e.data.slice(0,200));
        try{
          const d=JSON.parse(e.data);
          if(d.balance) setBal(d.balance.balance?.toString()||d.balance);
          if(d.msg_type==="balance") setBal(d.balance.balance);
        }catch{}
      };
      ws.onerror=()=>add("WS ERROR");
      ws.onclose=(ev)=>add("CLOSED code="+ev.code);
    }catch(e){ add("FETCH ERROR "+e.message); }
  };

  const buy=(dir)=>{
    const ws=wsRef.current;
    if(!ws) return;
    // New API buy format: proposal -> buy
    ws.send(JSON.stringify({proposal:1, amount:1, basis:"stake", contract_type:dir, currency:"USD", duration:5, duration_unit:"t", symbol:"R_75"}));
    add("Proposal "+dir);
  };

  return(
    <div style={{background:"#000",color:"#fff",padding:12,minHeight:"100vh",fontFamily:"monospace"}}>
      <h3>PROFITLANCE v4 - NEW API (pat_)</h3>
      <textarea value={token} onChange={e=>setToken(e.target.value)} placeholder="Paste pat_... 68 chars" style={{width:"100%",height:70,background:"#111",color:"#0f0",padding:8}}/>
      <div>len {token.trim().length} (need 68)</div>
      <button onClick={connectNewAPI} style={{width:"100%",padding:12,background:ok?"#0a0":"#0f0",fontWeight:"bold",marginTop:8}}>{ok?"BAL $"+bal+" REAL ✅":"CONNECT REAL (NEW API)"}</button>
      <div style={{display:"flex",gap:8,marginTop:8}}><button onClick={()=>buy("CALL")} style={{flex:1,padding:14,background:"#0f0"}}>BUY UP</button><button onClick={()=>buy("PUT")} style={{flex:1,padding:14,background:"#f00",color:"#fff"}}>SELL DOWN</button></div>
      <div style={{marginTop:8}}>BAL ${bal} {ok?"REAL":"DEMO"}</div>
      <div style={{background:"#111",marginTop:10,padding:8,height:350,overflow:"auto",fontSize:11,wordBreak:"break-all"}}>{logs.map((l,i)=><div key={i} style={{borderBottom:"1px solid #222"}}>{l}</div>)}</div>
    </div>
  );
        }
