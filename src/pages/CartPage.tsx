import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()

  if (!items.length) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h1>Your cart is empty.</h1>
          <p>Add a few pieces and come back when you’re ready.</p>
          <Link to="/products" className="btn primary">Browse products</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your selection</p>
            <h1>Shopping cart</h1>
          </div>
        </div>

        <div className="cart-layout">
          <div className="cart-list">
            {items.map(item => (
              <article className="cart-item" key={item.product.id}>
                <img src={item.product.image_url || '/products/lounge-chair.svg'} alt={item.product.name} />
                <div className="cart-item-copy">
                  <strong>{item.product.name}</strong>
                  <span>SGD {item.product.price.toFixed(2)} each</span>
                  <button className="text-button" onClick={() => removeItem(item.product.id)}>Remove</button>
                </div>
                <input
                  aria-label={`Quantity for ${item.product.name}`}
                  className="input qty-input"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={e => updateQuantity(item.product.id, Number(e.target.value))}
                />
                <strong>SGD {(item.product.price * item.quantity).toFixed(2)}</strong>
              </article>
            ))}
          </div>

          <aside className="summary-card">
            <h2>Order summary</h2>
            <div className="summary-row"><span>Subtotal</span><strong>SGD {total.toFixed(2)}</strong></div>
            <div className="summary-row"><span>Delivery</span><span>Confirmed separately</span></div>
            <div className="summary-total"><span>Items total</span><strong>SGD {total.toFixed(2)}</strong></div>
            <p className="muted delivery-note">Any delivery charges will be confirmed separately by our team.</p>
            <Link to="/checkout" className="btn primary full">Proceed to checkout</Link>
          </aside>
        </div>
      </div>
    </section>
  )
}
