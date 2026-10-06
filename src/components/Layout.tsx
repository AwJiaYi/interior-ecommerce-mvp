import { Link, NavLink, Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Layout() {
  const { count } = useCart()

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="container nav-wrap">
          <Link to="/" className="brand">
            <span className="brand-mark">AH</span>
            <span>
              <strong>Atelier Haus</strong>
              <small>Interior Living</small>
            </span>
          </Link>

          <nav aria-label="Main navigation">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Shop</NavLink>
            <NavLink to="/cart">Cart ({count})</NavLink>
            <NavLink to="/admin/login" className="admin-link">Admin</NavLink>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <strong>Atelier Haus</strong>
            <p>Thoughtful furniture and decor for warm, modern spaces.</p>
          </div>
          <div>
            <strong>Contact</strong>
            <p>hello@atelierhaus.sg<br />+65 6000 1234<br />Singapore</p>
          </div>
          <div>
            <strong>Customer Care</strong>
            <p>Delivery information<br />Payment verification<br />Product enquiries</p>
          </div>
        </div>
      </footer>
    </>
  )
}
