// client/src/pages/Success.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "";

// Treat these as final failure
const HARD_FAIL = ["FAILED", "CANCELLED", "EXPIRED"];

// Treat these as “ok/processing”
const OK_OR_PENDING = ["PAID", "SUCCESS", "CHARGED", "PENDING", "AUTHORIZED", "CREATED"];

// Polling config
const INTERVAL_MS = 3000;     // poll every 3s
const CUTOFF_MS   = 30000;    // after 30s, confirm anyway if not failed

export default function Success() {
  const [sp] = useSearchParams();
  const orderId = sp.get("order_id") || "";

  // OPTIMISTIC: shown immediately
  // CONFIRMED: confirmed by CF or by 30s cutoff
  // FAILED: hard failure from CF
  const [uiStatus, setUiStatus] = useState("OPTIMISTIC");
  const [gatewayStatus, setGatewayStatus] = useState(""); // last known from Cashfree

  const pollTimer = useRef(null);
  const cutoffTimer = useRef(null);
  const stopped = useRef(false);

  const title = useMemo(() => {
    if (uiStatus === "FAILED") return "Payment Failed";
    return "Payment Successful";
  }, [uiStatus]);

  const subtitle = useMemo(() => {
    if (uiStatus === "FAILED") return "We couldn’t confirm your payment.";
    if (uiStatus === "CONFIRMED") return "Your payment has been confirmed.";
    // OPTIMISTIC
    return "Thanks! Your payment is processing with your bank. We’ll confirm shortly.";
  }, [uiStatus]);

  function stopAll() {
    stopped.current = true;
    if (pollTimer.current) clearTimeout(pollTimer.current);
    if (cutoffTimer.current) clearTimeout(cutoffTimer.current);
  }

  async function pollOnce() {
    if (stopped.current) return;

    try {
      const { data } = await axios.get(`${API_BASE}/api/order-status`, {
        params: { order_id: orderId },
      });

      const st = String(data?.order_status || "").toUpperCase();
      setGatewayStatus(st);

      if (HARD_FAIL.includes(st)) {
        setUiStatus("FAILED");
        stopAll();
        return;
      }

      if (st === "PAID" || st === "SUCCESS" || st === "CHARGED") {
        setUiStatus("CONFIRMED");
        stopAll();
        return;
      }

      // still pending/authorized/created — keep polling until cutoff fires
      pollTimer.current = setTimeout(pollOnce, INTERVAL_MS);
    } catch (_e) {
      // transient error; try again until cutoff
      pollTimer.current = setTimeout(pollOnce, INTERVAL_MS);
    }
  }

  useEffect(() => {
    if (!orderId) {
      setUiStatus("FAILED");
      return;
    }

    // immediately show optimistic success
    setUiStatus("OPTIMISTIC");
    stopped.current = false;

    // start polling
    pollOnce();

    // cutoff: after 30s, confirm anyway (unless a hard fail happened)
    cutoffTimer.current = setTimeout(() => {
      if (!stopped.current && uiStatus !== "FAILED") {
        setUiStatus("CONFIRMED");
        stopAll();
      }
    }, CUTOFF_MS);

    return stopAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div className="panel">
      <h2>Payment Status</h2>
      <p style={{ marginTop: 6, fontSize: 18, fontWeight: 700 }}>{title}</p>
      <p style={{ marginTop: 6 }}>{subtitle}</p>

      {!!gatewayStatus && (
        <p className="muted" style={{ marginTop: 8 }}>
          Gateway status: <b>{gatewayStatus}</b>
        </p>
      )}
      <p className="muted" style={{ marginTop: 4 }}>
        Order ID: <b>{orderId}</b>
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Link className="btn" to="/">Back to Home</Link>
        {uiStatus !== "FAILED" && (
          <button
            className="btn"
            onClick={() => {
              // manual refresh
              if (pollTimer.current) clearTimeout(pollTimer.current);
              pollOnce();
            }}
          >
            Refresh Status
          </button>
        )}
      </div>
    </div>
  );
}
