import { Link } from 'react-router-dom'

export default function OrderConfirmationPage() {
  const raw = sessionStorage.getItem('latest-order')
  const order = raw ? JSON.parse(raw) : null

  return (
    <section className="section">
      <div className="container confirmation-card">
        <div className="success-icon">✓</div>
        <p className="eyebrow">Order submitted</p>
        <h1>Thank you.</h1>
        <p>Your order and payment proof have been submitted for verification.</p>

        <div className="confirmation-details">
          <div><span>Order ID</span><strong>{order?.orderNo || 'Submitted order'}</strong></div>
          <div><span>Amount</span><strong>SGD {Number(order?.amount || 0).toFixed(2)}</strong></div>
          <div><span>Status</span><strong>{order?.status || 'Awaiting Payment Verification'}</strong></div>
        </div>

        <Link to="/products" className="btn secondary">Continue shopping</Link>
      </div>
    </section>
  )
}
