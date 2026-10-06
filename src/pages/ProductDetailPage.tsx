import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Product } from '../types'
import { demoProducts } from '../lib/demoProducts'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import Loading from '../components/Loading'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState('')
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')
  const [product, setProduct] = useState<Product | null>(
    demoProducts.find(p => p.id === id) || null
  )

  useEffect(() => {
    if (!id || !isSupabaseConfigured || !supabase) return
    setLoading(true)
    setError('')
    setAdded('')
    supabase.from('products').select('*').eq('id', id).maybeSingle().then(({ data, error }) => {
      if (error) setError('Unable to load this product. Please refresh to try again.')
      if (data) setProduct(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <section className="section"><div className="container"><Loading label="Loading product…" /></div></section>
  if (error) return <section className="section"><div className="container"><div className="error-box" role="alert">{error}</div><Link className="btn secondary" to="/products">Back to shop</Link></div></section>
  if (!product) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h2>Product not found</h2><p className="muted">Explore the collection for another piece.</p><Link className="btn secondary" to="/products">Back to shop</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container"><Link className="text-link back-link" to="/products">← Back to collection</Link><div className="product-detail">
        <div className="detail-image-card">
          <img src={product.image_url || '/products/lounge-chair.svg'} alt={product.name} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">SGD {product.price.toFixed(2)}</p>
          <p>{product.description}</p>
          {product.specification && (
            <div className="spec-box">
              <strong>Specifications</strong>
              <p>{product.specification}</p>
            </div>
          )}
          <label className="field">
            <span>Quantity</span>
            <input
              className="input qty-input"
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
            />
          </label>
          <button className="btn primary" onClick={() => { addItem(product, quantity); setAdded(`${quantity} × ${product.name} added to cart.`) }}>
            Add {quantity} to cart
          </button>
          <div className="cart-feedback" role="status">{added && <>{added} <Link className="text-link" to="/cart">View cart →</Link></>}</div>
        </div>
      </div>
      </div>
    </section>
  )
}
