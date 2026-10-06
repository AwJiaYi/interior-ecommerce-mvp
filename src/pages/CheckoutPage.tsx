import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { CheckoutCustomer } from '../types'

const initialCustomer: CheckoutCustomer = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(initialCustomer)
  const [proof, setProof] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (!proof) { setPreview(''); return }
    const url = URL.createObjectURL(proof)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [proof])

  if (!items.length) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h2>Your cart is empty</h2><p className="muted">Choose your pieces before checking out.</p><Link className="btn primary" to="/products">Browse products</Link>
        </div>
      </section>
    )
  }

const orderNo = () =>
  `ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`

  async function submitOrder(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError('')

    if (!customer.fullName.trim() || !customer.phone.trim() || !customer.email.trim() || !customer.address.trim()) {
      setError('Please complete all required customer fields.')
      return
    }
    if (!proof) {
      setError('Please upload your payment screenshot.')
      return
    }

    setSubmitting(true)
    const friendlyOrderNo = orderNo()

    try {
      if (isSupabaseConfigured && supabase) {
        const orderId = crypto.randomUUID()
        const extension = proof.name.split('.').pop()?.toLowerCase() || 'jpg'
        const proofPath = `${orderId}/payment-proof.${extension}`

        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(proofPath, proof, { upsert: false, contentType: proof.type || undefined })
        if (uploadError) throw uploadError

        const { error: orderError } = await supabase.from('orders').insert({
          id: orderId,
          order_no: friendlyOrderNo,
          full_name: customer.fullName,
          phone: customer.phone,
          email: customer.email,
          delivery_address: customer.address,
          total_amount: total,
          status: 'awaiting_payment_verification',
          payment_proof_path: proofPath,
        })
        if (orderError) throw orderError

        const orderItems = items.map(item => ({
          order_id: orderId,
          product_id: item.product.id.startsWith('demo-') ? null : item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          subtotal: item.product.price * item.quantity,
        }))

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
        if (itemsError) throw itemsError
      }

      sessionStorage.setItem('latest-order', JSON.stringify({
        orderNo: friendlyOrderNo,
        amount: total,
        status: 'Awaiting Payment Verification',
      }))
      clearCart()
      navigate('/order-confirmation')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to submit order.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section">
      <div className="container checkout-grid">
        <form className="checkout-form" onSubmit={submitOrder} aria-busy={submitting}>
          <p className="eyebrow">Checkout</p>
          <h1>Delivery & payment</h1>
          <p className="muted">Enter your delivery details, then upload your payment screenshot. Fields marked * are required.</p>

          <fieldset disabled={submitting} className="form-fields">
          <legend className="sr-only">Delivery and payment details</legend>
          <div className="form-grid">
            <label className="field">
              <span>Full Name *</span>
              <input className="input" required autoComplete="name" name="fullName" value={customer.fullName}
                onChange={e => setCustomer({ ...customer, fullName: e.target.value })} />
            </label>
            <label className="field">
              <span>Phone Number *</span>
              <input className="input" required type="tel" autoComplete="tel" name="phone" value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
            </label>
            <label className="field">
              <span>Email Address *</span>
              <input className="input" required type="email" autoComplete="email" name="email" value={customer.email}
                onChange={e => setCustomer({ ...customer, email: e.target.value })} />
            </label>
            <label className="field full-span">
              <span>Delivery Address *</span>
              <textarea className="input textarea" required autoComplete="street-address" name="address" value={customer.address}
                onChange={e => setCustomer({ ...customer, address: e.target.value })} />
            </label>
          </div>

          <div className="payment-box">
            <div>
              <p className="eyebrow">NETSPay QR</p>
              <h2>Payment by NETSPay</h2>
              <p><strong>Items total: SGD {total.toFixed(2)}</strong></p>
              <p className="muted">
                This QR is a demo placeholder. For this demo, select a payment screenshot below. Payment proof is reviewed manually by our team.
              </p>
            </div>
            <img src="/netspay-qr-placeholder.svg" alt="NETSPay QR placeholder" className="qr-image" />
          </div>

          <label className="upload-box">
            <span>Upload payment screenshot *</span>
            <input
              type="file"
              required
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={e => setProof(e.target.files?.[0] || null)}
            />
            <small role="status">{proof ? `Selected: ${proof.name} · ${(proof.size / 1024).toFixed(0)} KB` : 'Select a JPG or PNG screenshot.'}</small>
            {preview && <img className="upload-preview" src={preview} alt="Selected payment screenshot preview" />}
          </label>
          </fieldset>

          {error && <div className="error-box" role="alert">{error}</div>}

          <button className="btn primary full" disabled={submitting}>
            {submitting ? 'Submitting order...' : 'Submit order'}
          </button>
        </form>

        <aside className="summary-card sticky-card">
          <h2>Order summary</h2>
          {items.map(item => (
            <div className="summary-row" key={item.product.id}>
              <span>{item.product.name} × {item.quantity}</span>
              <strong>SGD {(item.product.price * item.quantity).toFixed(2)}</strong>
            </div>
          ))}
          <div className="summary-total">
            <span>Items total</span>
            <strong>SGD {total.toFixed(2)}</strong>
          </div>
          <p className="muted delivery-note">Any delivery charges will be confirmed separately by our team. Payment remains subject to manual verification.</p>
        </aside>
      </div>
    </section>
  )
}
