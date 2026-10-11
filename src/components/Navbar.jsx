import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          Tech<span>Cart</span>
        </Link>

        <div className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Products
          </NavLink>
          <a href="/#categories" className="nav-link">
            Categories
          </a>
          {isAuthenticated && (
            <NavLink
              to="/orders"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              My Orders
            </NavLink>
          )}
        </div>

        <div className="nav-actions">
          <Link to="/cart" className="cart-button">
            🛒 Cart ({cartCount})
          </Link>

          {isAuthenticated ? (
            <div className="user-profile-menu">
              <span className="user-greeting">👤 {user?.name?.split(" ")[0]}</span>
              <button onClick={handleLogout} className="logout-button" title="Logout">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-button">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
