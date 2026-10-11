import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
  } = useCart();

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart-container">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added any tech goodies to your cart yet.</p>
          <Link to="/products" className="primary-button shop-now-cart-btn">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart ({cartCount} item{cartCount === 1 ? "" : "s"})</h1>
        <button className="clear-cart-text-btn" onClick={clearCart}>
          Clear Cart
        </button>
      </div>

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="cart-items-column">
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onIncrease={increaseQuantity}
              onDecrease={decreaseQuantity}
              onRemove={removeFromCart}
            />
          ))}

          <div className="cart-continue-shopping">
            <Link to="/products" className="secondary-button">
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="cart-summary-column">
          <div className="cart-summary-card">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Items Total ({cartCount})</span>
              <span>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping">FREE</span>
            </div>

            <div className="summary-row">
              <span>Taxes (Included)</span>
              <span>₹0</span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-total-row">
              <span>Grand Total</span>
              <span className="grand-total-amount">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <Link to="/checkout" className="primary-button checkout-btn">
              Proceed to Checkout &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
