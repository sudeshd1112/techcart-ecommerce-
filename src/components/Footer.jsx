import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="logo">
            Tech<span>Cart</span>
          </div>
          <p className="footer-desc">
            Your premium destination for latest technology, gadgets, and accessories.
          </p>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">All Products</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/products?category=Smartphones">Smartphones</Link></li>
            <li><Link to="/products?category=Laptops">Laptops</Link></li>
            <li><Link to="/products?category=Audio">Audio</Link></li>
            <li><Link to="/products?category=Gaming">Gaming</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Customer Service</h4>
          <ul>
            <li><Link to="/checkout">Checkout</Link></li>
            <li><Link to="/login">Account Login</Link></li>
            <li><Link to="/register">Create Account</Link></li>
            <li><a href="#support">24/7 Support</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TechCart. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
