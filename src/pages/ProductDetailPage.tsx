import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Product } from '../types'
import { demoProducts } from '../lib/demoProducts'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState<Product | null>(
    demoProducts.find(p => p.id === id) || null
  )

  useEffect(() => {
    if (!id || !isSupabaseConfigured || !supabase) return
    supabase.from('products').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (data) setProduct(data)
    })
  }, [id])

  if (!product) {
    return (
      <section className="section">
        <div className="container empty-state">
          Product not found. <Link to="/products">Back to shop</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container product-detail">
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
          <button className="btn primary" onClick={() => addItem(product, quantity)}>
            Add {quantity} to cart
          </button>
        </div>
      </div>
    </section>
  )
}
