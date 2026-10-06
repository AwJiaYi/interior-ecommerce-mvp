import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import type { Product } from '../types'
import { demoProducts } from '../lib/demoProducts'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>(demoProducts)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const category = searchParams.get('category') || 'All'

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data?.length) setProducts(data)
    })
  }, [])

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = category === 'All' || p.category === category
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [products, category, search])

  const changeCategory = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'All') next.delete('category')
    else next.set('category', value)
    setSearchParams(next)
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading shop-heading">
          <div>
            <p className="eyebrow">Collection</p>
            <h1>Shop interior pieces</h1>
          </div>
          <span>{filtered.length} products</span>
        </div>

        <div className="shop-controls">
          <input
            className="input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
          />
          <select className="input" value={category} onChange={e => changeCategory(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <ProductGrid products={filtered} />
      </div>
    </section>
  )
}
