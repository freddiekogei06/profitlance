            contract_type: type,
    "use client";
import { useRef, useState } from "react";

const WS_URL = "wss://ws.derivws.com/websockets/v3?app_id=1089";

export default function Page() {
  const [token, setToken] = useState("");
  const [log, setLog] = useState<string[]>(["Ready"]);
  const [balance, setBalance] = useState(0);
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  const add = (m: string) => setLog((l) => [...l.slice(-50), `${new Date().toLocaleTimeString()} ${m}`]);

  const connect = () => {
    if (!token) return add("Paste token first");
    const isPAT = token.startsWith("pat_");
    add(isPAT ? "PAT detected - using WS directly (skip REST)" : "a1_ token - using WS");
    
    if (ws.current) ws.current.close();
    const w = new WebSocket(WS_URL);
    ws.current = w;

    w.onopen = () => {
      add("WS OPEN");
      w.send(JSON.stringify({ authorize: token }));
      add("CONNECTING " + token.slice(0,8));
    };

    w.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.error) {
        add("ERROR: " + data.error.message);
        return;
      }
      if (data.msg_type === "authorize") {
        add("AUTHORIZED ✅ " + data.authorize.loginid);
        setConnected(true);
        setBalance(Number(data.authorize.balance));
        // subscribe balance
        w.send(JSON.stringify({ balance: 1, subscribe: 1 }));
        // subscribe R_75 ticks
        w.send(JSON.stringify({ ticks: "R_75", subscribe: 1 }));
      }
      if (data.msg_type === "balance") {
        setBalance(Number(data.balance.balance));
      }
    };

    w.onerror = () => add("WS ERROR");
    w.onclose = () => {
      add("WS CLOSED");
      setConnected(false);
    };
  };

  const buy = (dir: "CALL" | "PUT") => {
    if (!ws.current) return add("Not connected");
    const req = {
      buy: 1,
      price: 1,
      parameters: {
        amount: 1,
        basis: "stake",
        contract_type: dir,
        currency: "USD",
        duration: 1,
        duration_unit: "t",
        symbol: "R_75",
      }
    };
    ws.current.send(JSON.stringify(req));
    add(`BUY ${dir} x200 sent`);
  };

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 12, fontFamily: "monospace" }}>
      <h2>PROFITLANCE PAT+REAL R_75 O</h2>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value.trim())}
          placeholder="paste pat_ or a1- full token"
          style={{ flex: 1, padding: 10, background: "#111", color: "#fff", border: "1px solid #333" }}
        />
      </div>
      <button onClick={connect} style={{ width: "100%", marginTop: 8, padding: 12, background: connected ? "#0a0" : "#0f0", color: "#000", fontWeight: "bold" }}>
        {connected ? `CONNECTED BAL $${balance.toFixed(2)}` : "CONNECT REAL"}
      </button>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={() => buy("CALL")} style={{ flex: 1, padding: 16, background: "#0f0", fontWeight: "bold" }}>BUY UP x200</button>
        <button onClick={() => buy("PUT")} style={{ flex: 1, padding: 16, background: "#f00", color: "#fff", fontWeight: "bold" }}>SELL DOWN x200</button>
      </div>

      <div style={{ marginTop: 8, color: connected ? "#0f0" : "#f00" }}>BAL ${balance.toFixed(2)} - {connected ? "REAL" : "DEMO"}</div>

      <div style={{ background: "#111", marginTop: 10, padding: 8, height: 200, overflow: "auto", fontSize: 11 }}>
        {log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}                                                                                                                                                                                                                                                                                                                                                  currency: "USD",
                                                                                                                                                                                                                                                                                                                                                                duration: 5,
                                                                                                                                                                                                                                                                                                                                                                          duration_unit: "t",
                                                                                                                                                                                                                                                                                                                                                                                    symbol: "R_75",
                                                                                                                                                                                                                                                                                                                                                                                            },
                                                                                                                                                                                                                                                                                                                                                                                                  })
                                                                                                                                                                                                                                                                                                                                                                                                      );
                                                                                                                                                                                                                                                                                                                                                                                                          add("BUY " + dir);
                                                                                                                                                                                                                                                                                                                                                                                                            };
                                                                                                                                                                                                                                                                                                                                                                                                              return (
                                                                                                                                                                                                                                                                                                                                                                                                                  <div style={{ padding: 12, background: "#000", color: "#0f0", minHeight: "100vh", fontFamily: "monospace" }}>
                                                                                                                                                                                                                                                                                                                                                                                                                        <h2 style={{ color: "#0ff" }}>PROFITLANCE PAT+REAL R_75 {price}</h2>
                                                                                                                                                                                                                                                                                                                                                                                                                              <input
                                                                                                                                                                                                                                                                                                                                                                                                                                      value={token}
                                                                                                                                                                                                                                                                                                                                                                                                                                              onChange={(e) => setToken(e.target.value)}
                                                                                                                                                                                                                                                                                                                                                                                                                                                      placeholder="paste pat_ or a1- full token"
                                                                                                                                                                                                                                                                                                                                                                                                                                                              style={{ width: "100%", padding: 10, background: "#111", color: "#0f0", border: "1px solid #0f0" }}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  <button onClick={connect} style={{ flex: 1, padding: 12, background: "#00aa00", color: "#fff", fontWeight: "bold" }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            CONNECT REAL
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <div style={{ padding: 12, border: "1px solid #0f0" }}>BAL ${bal}</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <button onClick={() => buy("up")} style={{ flex: 1, padding: 22, background: "green", color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          BUY UP x200
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <button onClick={() => buy("down")} style={{ flex: 1, padding: 22, background: "red", color: "#fff", fontSize: 20, fontWeight: "bold" }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    SELL DOWN x200
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </button>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <div style={{ marginTop: 12, fontSize: 12 }}>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                {log.map((l, i) => (
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          <div key={i}>{l}</div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  ))}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              }
