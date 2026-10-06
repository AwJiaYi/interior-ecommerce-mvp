import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../../types'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import Loading from '../../components/Loading'

type FormState = {
  id?: string
  name: string
  price: string
  description: string
  specification: string
  category: string
  featured: boolean
  imageFile: File | null
  existingImageUrl?: string | null
}

const blank: FormState = {
  name: '',
  price: '',
  description: '',
  specification: '',
  category: 'Seating',
  featured: false,
  imageFile: null,
}

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<FormState>(blank)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)

  async function ensureAdmin() {
    if (!isSupabaseConfigured || !supabase) {
      navigate('/admin/login')
      return false
    }
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      navigate('/admin/login')
      return false
    }
    const { data: admin } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle()
    if (!admin) {
      navigate('/admin/login')
      return false
    }
    return true
  }

  async function loadProducts() {
    if (!supabase) return
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (error) { setMessage('Unable to load products. Please refresh to try again.'); return }
    setProducts(data || [])
  }

  useEffect(() => {
    ;(async () => {
      try {
        if (await ensureAdmin()) await loadProducts()
      } catch {
        setMessage('Unable to load products. Please refresh to try again.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function saveProduct(e: FormEvent) {
    e.preventDefault()
    if (!supabase || pending) return
    setMessage('')
    setPending(true)
    try {

    let imageUrl = form.existingImageUrl || null
    if (form.imageFile) {
      const ext = form.imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const filename = `${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, form.imageFile, { contentType: form.imageFile.type || undefined })
      if (uploadError) {
        setMessage(uploadError.message)
        return
      }
      imageUrl = supabase.storage.from('product-images').getPublicUrl(filename).data.publicUrl
    }

    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      specification: form.specification || null,
      category: form.category,
      featured: form.featured,
      image_url: imageUrl,
    }

    const result = form.id
      ? await supabase.from('products').update(payload).eq('id', form.id)
      : await supabase.from('products').insert(payload)

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    setForm(blank)
    setMessage('Product saved successfully.')
    await loadProducts()
    } catch {
      setMessage('Unable to save product. Please try again.')
    } finally {
      setPending(false)
    }
  }

  async function deleteProduct(id: string) {
    if (!supabase || pending || !confirm('Delete this product?')) return
    setPending(true)
    setMessage('')
    try {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) setMessage(error.message)
    else await loadProducts()
    } catch {
      setMessage('Unable to delete product. Please try again.')
    } finally {
      setPending(false)
    }
  }

  async function logout() {
    await supabase?.auth.signOut()
    navigate('/admin/login')
  }

  if (loading) return <section className="section"><div className="container"><Loading label="Loading products…" /></div></section>

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Owner dashboard</p>
            <h1>Product management</h1>
          </div>
          <div className="admin-actions">
            <button className="btn secondary" disabled={pending} onClick={() => navigate('/admin/orders')}>Orders</button>
            <button className="btn ghost" disabled={pending} onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="admin-layout">
          <form className="admin-card" onSubmit={saveProduct} aria-busy={pending}>
            <h2>{form.id ? 'Edit product' : 'Add product'}</h2>
            <fieldset className="form-fields" disabled={pending}><legend className="sr-only">Product details</legend>
            <label className="field"><span>Product name *</span>
              <input className="input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </label>
            <label className="field"><span>Price (SGD) *</span>
              <input className="input" required type="number" min="0" step="0.01" value={form.price}
                onChange={e => setForm({...form, price: e.target.value})} />
            </label>
            <label className="field"><span>Description *</span>
              <textarea className="input textarea" required value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} />
            </label>
            <label className="field"><span>Specifications</span>
              <textarea className="input textarea" value={form.specification}
                onChange={e => setForm({...form, specification: e.target.value})} />
            </label>
            <label className="field"><span>Category *</span>
              <input className="input" required value={form.category}
                onChange={e => setForm({...form, category: e.target.value})} />
            </label>
            <label className="field"><span>Product image (JPG/PNG)</span>
              <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={e => setForm({...form, imageFile: e.target.files?.[0] || null})} />
              <small role="status">{form.imageFile ? `Selected: ${form.imageFile.name}` : form.existingImageUrl ? 'Current image will be kept unless you select a replacement.' : 'Select a JPG or PNG image.'}</small>
              {(form.existingImageUrl && !form.imageFile) && <img className="upload-preview" src={form.existingImageUrl} alt="Current product image" />}
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={form.featured}
                onChange={e => setForm({...form, featured: e.target.checked})} />
              Featured product
            </label>
            </fieldset>
            {message && <div role={message.includes('successfully') ? 'status' : 'alert'} className={message.includes('successfully') ? 'success-box' : 'error-box'}>{message}</div>}
            <button className="btn primary full" disabled={pending}>{pending ? 'Working…' : form.id ? 'Update product' : 'Add product'}</button>
            {form.id && <button type="button" disabled={pending} className="btn ghost full" onClick={() => setForm(blank)}>Cancel edit</button>}
          </form>

          <div className="admin-product-list">
            {!products.length && <div className="empty-state"><h2>No products to display</h2><p className="muted">Use the product form to add your first piece.</p></div>}
            {products.map(product => (
              <article className="admin-product-row" key={product.id}>
                <img src={product.image_url || '/products/lounge-chair.svg'} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.category} · SGD {product.price.toFixed(2)}</span>
                </div>
                <div className="row-actions">
                  <button className="btn small secondary" disabled={pending} aria-label={`Edit ${product.name}`} onClick={() => setForm({
                    id: product.id,
                    name: product.name,
                    price: String(product.price),
                    description: product.description,
                    specification: product.specification || '',
                    category: product.category,
                    featured: product.featured,
                    imageFile: null,
                    existingImageUrl: product.image_url,
                  })}>Edit</button>
                  <button className="btn small danger" disabled={pending} aria-label={`Delete ${product.name}`} onClick={() => deleteProduct(product.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
