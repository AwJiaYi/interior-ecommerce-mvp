import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function login(e: FormEvent) {
    e.preventDefault()
    setMessage('')

    if (!isSupabaseConfigured || !supabase) {
      setMessage('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
      return
    }

    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (!adminRow) {
      await supabase.auth.signOut()
      setMessage('This account is not authorized as an administrator.')
      return
    }

    navigate('/admin/products')
  }

  return (
    <section className="section">
      <div className="container narrow">
        <form className="admin-card" onSubmit={login}>
          <p className="eyebrow">Owner access</p>
          <h1>Admin login</h1>
          <label className="field">
            <span>Email</span>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label className="field">
            <span>Password</span>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          {message && <div className="error-box">{message}</div>}
          <button className="btn primary full">Login</button>
        </form>
      </div>
    </section>
  )
}
