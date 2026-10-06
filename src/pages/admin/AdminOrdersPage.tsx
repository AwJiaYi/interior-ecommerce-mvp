import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Loading from '../../components/Loading'

type Order = {
  id: string
  order_no: string
  full_name: string
  email: string
  phone: string
  delivery_address: string
  total_amount: number
  status: string
  payment_proof_path: string | null
  created_at: string
}

export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
      if (!supabase) return navigate('/admin/login')
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return navigate('/admin/login')
      const { data: admin } = await supabase.from('admin_users')
        .select('user_id').eq('user_id', userData.user.id).maybeSingle()
      if (!admin) return navigate('/admin/login')
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (error) { setMessage('Unable to load orders. Please refresh to try again.'); return }
      setOrders(data || [])
      } catch {
        setMessage('Unable to load orders. Please refresh to try again.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function setStatus(orderId: string, status: string) {
    if (!supabase || pending) return
    setPending(true)
    setMessage('')
    try {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) setMessage(error.message)
    else setOrders(current => current.map(o => o.id === orderId ? { ...o, status } : o))
    } catch {
      setMessage('Unable to update order status. Please try again.')
    } finally {
      setPending(false)
    }
  }

  async function openProof(path: string | null) {
    if (!supabase || !path || pending) return
    setPending(true)
    setMessage('')
    try {
    const { data, error } = await supabase.storage.from('payment-proofs').createSignedUrl(path, 120)
    if (error) setMessage(error.message)
    else window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } catch {
      setMessage('Unable to open payment proof. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Owner dashboard</p>
            <h1>Orders</h1>
          </div>
          <button className="btn secondary" disabled={pending} onClick={() => navigate('/admin/products')}>Products</button>
        </div>

        {message && <div className="error-box" role="alert">{message}</div>}
        {pending && <div role="status" className="operation-status">Working…</div>}
        {loading ? <Loading label="Loading orders…" /> : !orders.length ? <div className="empty-state"><h2>{message ? 'Orders unavailable' : 'No orders yet'}</h2><p className="muted">{message ? 'Please refresh to try again.' : 'Submitted orders will appear here for payment review.'}</p></div> : <>
        <p className="muted table-hint">Scroll horizontally on smaller screens to see all order details.</p>

        <div className="orders-table-wrap" role="region" aria-label="Customer orders" tabIndex={0} aria-busy={pending}>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Payment proof</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.order_no}</strong><br /><small>{new Date(order.created_at).toLocaleString()}</small></td>
                  <td>{order.full_name}<br /><small>{order.email} · {order.phone}</small></td>
                  <td>SGD {order.total_amount.toFixed(2)}</td>
                  <td>
                    <select className="input" aria-label={`Status for ${order.order_no}`} disabled={pending} value={order.status} onChange={e => setStatus(order.id, e.target.value)}>
                      <option value="awaiting_payment_verification">Awaiting Payment Verification</option>
                      <option value="payment_verified">Payment Verified</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn small secondary" aria-label={`View payment proof for ${order.order_no}`} disabled={pending || !order.payment_proof_path}
                      onClick={() => openProof(order.payment_proof_path)}>
                      View proof
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>}
      </div>
    </section>
  )
}
