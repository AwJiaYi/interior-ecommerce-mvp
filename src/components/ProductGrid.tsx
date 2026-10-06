import type { Product } from '../types'
import ProductCard from './ProductCard'

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return <div className="empty-state"><h2>No products found</h2><p className="muted">Try another search or category.</p></div>
  return (
    <div className="product-grid">
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}
