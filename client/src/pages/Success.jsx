
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const PAID_STATUSES = ["PAID", "SUCCESS", "CHARGED"];        // treat as success
const WAIT_STATUSES = ["PENDING", "AUTHORIZED", "CREATED"];  // keep polling
const FAIL_STATUSES = ["FAILED", "EXPIRED", "CANCELLED"];    // stop as failed

export default function Success() {
  const [sp] = useSearchParams();
  const orderId = sp.get("order_id") || "";
  const [state, setState] = useState({
    phase: "checking", // checking | success | failed | timeout
    status: "",
    data: null,
    tries: 0,
  });

  const maxTries = 25;          // ~25 * 3s = 75s
  const delayMs = 3000;
  const timer = useRef(null);

  const statusText = useMemo(() => {
    if (state.phase === "success") return "Payment Successful";
    if (state.phase === "failed") return "Payment Failed";
    if (state.phase === "timeout") return "We’re still processing your payment…";
    return "Validating payment…";
  }, [state.phase]);

  async function fetchStatus(id) {
    try {
      const { data } = await axios.get(`${API_BASE}/api/order-status`, {
        params: { order_id: id },
      });

      const st = String(data?.order_status || "").toUpperCase();

      if (PAID_STATUSES.includes(st)) {
        setState((s) => ({ ...s, phase: "success", status: st, data }));
        return true;
      }
      if (FAIL_STATUSES.includes(st)) {
        setState((s) => ({ ...s, phase: "failed", status: st, data }));
        return true;
      }

      // still pending/authorized — keep polling
      setState((s) => ({ ...s, phase: "checking", status: st, data, tries: s.tries + 1 }));
      return false;
    } catch (e) {
      // network/server hiccup — keep trying a few times
      setState((s) => ({ ...s, tries: s.tries + 1 }));
      return false;
    }
  }

  useEffect(() => {
    if (!orderId) {
      setState({ phase: "failed", status: "UNKNOWN", data: null, tries: 0 });
      return;
    }

    let cancelled = false;

    async function poll() {
      const done = await fetchStatus(orderId);
      if (cancelled || done) return;

      if (state.tries + 1 >= maxTries) {
        setState((s) => ({ ...s, phase: "timeout" }));
        return;
      }
      timer.current = setTimeout(poll, delayMs);
    }

    // first call immediately
    poll();

    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, state.tries]);

  return (
    <div className="panel">
      <h2>Payment Status</h2>
      <p style={{ marginTop: 8 }}>{statusText}</p>

      {!!state.status && (
        <p className="muted" style={{ marginTop: 6 }}>
          Gateway status: <b>{state.status}</b>
        </p>
      )}

      {state.phase === "success" && (
        <div style={{ marginTop: 16 }}>
          <p>Your order <b>{orderId}</b> has been paid. 🎉</p>
          <Link className="btn" to="/">Back to Home</Link>
        </div>
      )}

      {state.phase === "failed" && (
        <div style={{ marginTop: 16 }}>
          <p>We could not confirm your payment for <b>{orderId}</b>.</p>
          <Link className="btn" to="/">Back to Home</Link>
        </div>
      )}

      {state.phase === "timeout" && (
        <div style={{ marginTop: 16 }}>
          <p>
            We’re still waiting for confirmation from your bank. This can take a
            minute for UPI/net-banking. You can refresh this page or check your
            order later.
          </p>
          <button className="btn" onClick={() => setState((s) => ({ ...s, tries: 0, phase: "checking" }))}>
            Retry Now
          </button>
        </div>
      )}
    </div>
  );
}
