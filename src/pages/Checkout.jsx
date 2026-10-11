import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apiCreateOrder } from "../services/api";

function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // Sync user info if auth state updates
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email,
      }));
    }
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) newErrors.address = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6-digit postal code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty. Please add items to checkout.");
      return;
    }

    // Require login to place order
    if (!isAuthenticated || !token) {
      setServerError("Please login or register to complete your order.");
      navigate("/login?redirect=/checkout");
      return;
    }

    try {
      setLoading(true);
      setServerError("");

      const orderPayload = {
        orderItems: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: formData,
      };

      const res = await apiCreateOrder(orderPayload, token);

      setPlacedOrderDetails({
        orderId: res.orderId,
        totalAmount: res.totalAmount || cartTotal,
        shipping: formData,
      });

      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setServerError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (orderPlaced && placedOrderDetails) {
    return (
      <div className="checkout-page">
        <div className="order-success-card">
          <div className="success-icon">🎉</div>
          <h2>Order Placed Successfully!</h2>
          <p className="order-id-badge">
            Order Reference: <strong>#TC-{placedOrderDetails.orderId}</strong>
          </p>
          <p className="success-msg">
            Thank you for shopping with TechCart! Your order has been registered in our database
            and is now being processed.
          </p>
          <div className="success-shipping-info">
            <h4>Delivery Details:</h4>
            <p>{placedOrderDetails.shipping.fullName}</p>
            <p>
              {placedOrderDetails.shipping.address}, {placedOrderDetails.shipping.city},{" "}
              {placedOrderDetails.shipping.state} - {placedOrderDetails.shipping.pincode}
            </p>
            <p>
              Phone: {placedOrderDetails.shipping.phone} | Email: {placedOrderDetails.shipping.email}
            </p>
            <p>
              <strong>Grand Total Paid:</strong> ₹{placedOrderDetails.totalAmount.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="success-actions">
            <Link to="/orders" className="primary-button">
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart-container">
          <h2>Your Cart is Empty</h2>
          <p>Please add products to your cart before proceeding to checkout.</p>
          <Link to="/products" className="primary-button">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p>Complete your shipping information and review your order.</p>
      </div>

      {!isAuthenticated && (
        <div className="checkout-auth-banner">
          <span>💡 Already have an account?</span>
          <Link to="/login?redirect=/checkout" className="checkout-login-link">
            Log in here
          </Link>{" "}
          to save this order to your account!
        </div>
      )}

      {serverError && <div className="auth-error-banner">{serverError}</div>}

      <div className="checkout-layout">
        {/* Checkout Form */}
        <div className="checkout-form-column">
          <form onSubmit={handleSubmit} noValidate>
            {/* Customer Information */}
            <div className="form-section">
              <h3>1. Customer Information</h3>

              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? "input-error" : ""}
                  disabled={loading}
                />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="e.g. rahul@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "input-error" : ""}
                    disabled={loading}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "input-error" : ""}
                    disabled={loading}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="form-section">
              <h3>2. Shipping Address</h3>

              <div className="form-group">
                <label htmlFor="address">Street Address *</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  placeholder="Flat / House no, Building name, Street"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? "input-error" : ""}
                  disabled={loading}
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>

              <div className="form-row form-row-three">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? "input-error" : ""}
                    disabled={loading}
                  />
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    className={errors.state ? "input-error" : ""}
                    disabled={loading}
                  />
                  {errors.state && <span className="error-text">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">Pincode *</label>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    placeholder="6-digit pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={errors.pincode ? "input-error" : ""}
                    disabled={loading}
                  />
                  {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                </div>
              </div>
            </div>

            {/* Simulated Payment Notice */}
            <div className="payment-notice-box">
              <span className="info-icon">ℹ️</span>
              <p>
                <strong>Demo Mode:</strong> Payment gateway is simulated. Order is verified and registered securely in the MySQL database.
              </p>
            </div>

            <button
              type="submit"
              className="primary-button place-order-btn"
              disabled={loading}
            >
              {loading
                ? "Processing Order..."
                : `Place Order (₹${cartTotal.toLocaleString("en-IN")})`}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="checkout-summary-column">
          <div className="checkout-summary-card">
            <h3>Order Summary ({cart.length} item{cart.length === 1 ? "" : "s"})</h3>

            <div className="checkout-items-list">
              {cart.map((item) => (
                <div key={item.id} className="checkout-item-row">
                  <img src={item.image} alt={item.name} className="checkout-thumb" />
                  <div className="checkout-item-desc">
                    <p className="item-title">{item.name}</p>
                    <p className="item-meta">
                      {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="checkout-item-price">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <hr className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-row">
              <span>Standard Delivery</span>
              <span className="free-shipping">FREE</span>
            </div>

            <div className="summary-total-row">
              <span>Total Payable</span>
              <span className="grand-total-amount">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
