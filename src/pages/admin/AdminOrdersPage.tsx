import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

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

  useEffect(() => {
    ;(async () => {
      if (!supabase) return navigate('/admin/login')
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return navigate('/admin/login')
      const { data: admin } = await supabase.from('admin_users')
        .select('user_id').eq('user_id', userData.user.id).maybeSingle()
      if (!admin) return navigate('/admin/login')
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      setOrders(data || [])
    })()
  }, [])

  async function setStatus(orderId: string, status: string) {
    if (!supabase) return
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) setMessage(error.message)
    else setOrders(current => current.map(o => o.id === orderId ? { ...o, status } : o))
  }

  async function openProof(path: string | null) {
    if (!supabase || !path) return
    const { data, error } = await supabase.storage.from('payment-proofs').createSignedUrl(path, 120)
    if (error) setMessage(error.message)
    else window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Owner dashboard</p>
            <h1>Orders</h1>
          </div>
          <button className="btn secondary" onClick={() => navigate('/admin/products')}>Products</button>
        </div>

        {message && <div className="error-box">{message}</div>}

        <div className="orders-table-wrap">
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
                    <select className="input" value={order.status} onChange={e => setStatus(order.id, e.target.value)}>
                      <option value="awaiting_payment_verification">Awaiting Payment Verification</option>
                      <option value="payment_verified">Payment Verified</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn small secondary" disabled={!order.payment_proof_path}
                      onClick={() => openProof(order.payment_proof_path)}>
                      View proof
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
