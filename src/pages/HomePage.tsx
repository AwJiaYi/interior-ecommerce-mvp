import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { demoProducts } from '../lib/demoProducts'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import ProductGrid from '../components/ProductGrid'
import Loading from '../components/Loading'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(demoProducts.filter(p => p.featured).slice(0, 3))
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (error) setError('Unable to load featured products. Please refresh to try again.')
        if (data?.length) setProducts(data)
        setLoading(false)
      })
  }, [])

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Modern interiors · Singapore</p>
            <h1>Quiet pieces for thoughtful spaces.</h1>
            <p className="hero-copy">
              Curated furniture, lighting and decor selected for warm, contemporary homes.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn primary">Shop collection</Link>
              <a href="#categories" className="btn ghost">Explore categories</a>
            </div>
          </div>
          <div className="hero-panel">
            <img src="/hero-interior.png" alt="Featured lounge chair" />
            <div>
              <span>Curated Interior</span>
              <strong>Warm modern living</strong>
              <small>Furniture, lighting and decor selected to work together.</small>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Browse by category</p>
              <h2>Designed to work together.</h2>
            </div>
          </div>
          <div className="category-grid">
            {['Seating', 'Lighting', 'Tables', 'Decor', 'Storage'].map(category => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="category-card"
              >
                <span>{category}</span>
                <span>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Featured products</p>
              <h2>Editor’s picks.</h2>
            </div>
            <Link to="/products" className="text-link">View all products →</Link>
          </div>
          {error && <div className="error-box" role="alert">{error}</div>}
          {loading ? <Loading label="Loading featured pieces…" /> : !error && <ProductGrid products={products} />}
        </div>
      </section>

      <section className="section">
        <div className="container split-panel">
          <div>
            <p className="eyebrow">About us</p>
            <h2>Interior pieces chosen with restraint.</h2>
          </div>
          <p>
            Atelier Haus helps homeowners create calm, functional rooms with a concise collection
            of furniture, lighting and finishing pieces. Our online store makes it easy to discover,
            compare and order products from one place.
          </p>
        </div>
      </section>
    </>
  )
}
