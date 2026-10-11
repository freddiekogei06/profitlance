"use client";
import { useRef, useState } from "react";
const WS_URL = "wss://ws.derivws.com/websockets/v3?app_id=1089";

export default function Page(){
  const [token,setToken]=useState("");
  const [logs,setLogs]=useState(["Ready"]);
  const [bal,setBal]=useState(0);
  const [ok,setOk]=useState(false);
  const ws=useRef(null);
  const add=(m:string)=>setLogs(p=>[...p.slice(-50),m]);

  const connect=()=>{
    const t=token.trim();
    if(!t)return add("Paste token");
    if(ws.current) ws.current.close();
    const w=new WebSocket(WS_URL);
    // @ts-ignore
    ws.current=w;
    w.onopen=()=>{
      add("WS OPEN");
      w.send(JSON.stringify({authorize:t}));
      add("CONNECTING "+t.slice(0,8));
    };
    w.onmessage=(e)=>{
      const d=JSON.parse(e.data);
      if(d.error){add("ERR "+d.error.message);return;}
      if(d.msg_type==="authorize"){
        add("AUTHORIZED "+d.authorize.loginid);
        setOk(true);
        setBal(d.authorize.balance);
        w.send(JSON.stringify({balance:1,subscribe:1}));
        w.send(JSON.stringify({ticks:"R_75",subscribe:1}));
      }
      if(d.msg_type==="balance")setBal(d.balance.balance);
    };
    w.onclose=()=>{add("CLOSED");setOk(false);};
  };

  const buy=(dir:string)=>{
    if(!ws.current)return;
    // @ts-ignore
    ws.current.send(JSON.stringify({buy:1,price:1,parameters:{amount:1,basis:"stake",contract_type:dir,currency:"USD",duration:5,duration_unit:"t",symbol:"R_75"}}));
    add("BUY "+dir);
  };

  return(
    <div style={{background:"#000",color:"#fff",padding:12,minHeight:"100vh"}}>
      <h3>PROFITLANCE PAT FIX</h3>
      <input value={token} onChange={e=>setToken(e.target.value)} placeholder="pat_ or a1- token" style={{width:"100%",padding:10}}/>
      <button onClick={connect} style={{width:"100%",padding:12,marginTop:8,background: ok ? "#0a0" : "#0f0"}}>{ok ? "BAL $"+bal.toFixed(2) : "CONNECT REAL"}</button>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        <button onClick={()=>buy("CALL")} style={{flex:1,padding:15,background:"#0f0"}}>BUY UP</button>
        <button onClick={()=>buy("PUT")} style={{flex:1,padding:15,background:"#f00",color:"#fff"}}>SELL DOWN</button>
      </div>
      <div>BAL ${bal.toFixed(2)} {ok ? "REAL" : "DEMO"}</div>
      <div style={{background:"#111",marginTop:10,padding:8,height:180,overflow:"auto",fontSize:11}}>{logs.map((l,i)=><div key={i}>{l}</div>)}</div>
    </div>
  );
      }
