import { useState, type FormEvent } from "react";
import { trackGuestOrder, type GuestOrderTracking } from "@/lib/shopApi";

function formatMoney(minor: number, currency: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: currency || "BDT",
    maximumFractionDigits: 2,
  }).format(minor / 100);
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<GuestOrderTracking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const result = await trackGuestOrder(orderId, phone);
      setOrder(result);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Order tracking is temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="content-width page-content">
      <section className="page-heading">
        <span className="eyebrow">Guest order lookup</span>
        <h1>Track your order</h1>
        <p>Enter the Order ID and the Bangladesh phone number used at checkout.</p>
      </section>

      <form className="auth-card" onSubmit={submit}>
        <label className="form-field">
          <span>Order ID</span>
          <input
            value={orderId}
            onChange={event => setOrderId(event.target.value)}
            placeholder="Paste your order UUID"
            autoComplete="off"
            required
          />
        </label>
        <label className="form-field">
          <span>Checkout phone number</span>
          <input
            value={phone}
            onChange={event => setPhone(event.target.value)}
            placeholder="01XXXXXXXXX"
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="button button-dark button-wide" type="submit" disabled={loading}>
          {loading ? "Checking order…" : "Track order"}
        </button>
      </form>

      {order && (
        <section className="order-detail-layout" aria-live="polite">
          <div className="order-status-card">
            <span className="eyebrow">{order.order.order_number}</span>
            <h2>{order.order.status.replaceAll("_", " ")}</h2>
            <p>Placed {new Date(order.order.created_at).toLocaleString("en-BD")}</p>
            <div className="tracking-steps">
              {order.items.map((item, index) => (
                <div key={`${item.product_title_snapshot}-${index}`} className="active">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.product_title_snapshot}</strong>
                  <small>{item.variant_title_snapshot} × {item.quantity}</small>
                  <small>{formatMoney(item.line_total_minor, order.order.currency)}</small>
                </div>
              ))}
            </div>
            <p>Delivery status: {order.delivery.status.replaceAll("_", " ")}</p>
            {order.delivery.tracking_url && (
              <a className="text-link" href={order.delivery.tracking_url} target="_blank" rel="noreferrer">
                Open delivery tracking
              </a>
            )}
          </div>
          <aside className="summary-card">
            <span className="eyebrow">Order total</span>
            <strong>{formatMoney(order.order.total_minor, order.order.currency)}</strong>
            <p>Payment: {order.order.payment_method} · {order.order.payment_status}</p>
          </aside>
        </section>
      )}
    </main>
  );
}
