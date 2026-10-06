import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-wrap">
        <img
          className="product-image"
          src={product.image_url || '/products/lounge-chair.svg'}
          alt={product.name}
        />
      </Link>
      <div className="product-card-body">
        <div>
          <p className="eyebrow">{product.category}</p>
          <Link to={`/products/${product.id}`} className="product-title">{product.name}</Link>
        </div>
        <p className="product-price">SGD {product.price.toFixed(2)}</p>
        <button className="btn secondary full" onClick={() => addItem(product, 1)}>
          Add to cart
        </button>
      </div>
    </article>
  )
}
