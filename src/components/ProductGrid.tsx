import type { Product } from '../types'
import ProductCard from './ProductCard'

export default function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return <div className="empty-state">No products found.</div>
  return (
    <div className="product-grid">
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}
