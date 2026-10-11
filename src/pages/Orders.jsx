import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGetUserOrders } from "../services/api";

function Orders() {
  const { user, token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated && token) {
      setLoading(true);
      setError(null);

      apiGetUserOrders(token)
        .then((data) => {
          if (isMounted) {
            setOrders(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message);
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="empty-orders-card">
          <div className="empty-icon">🔒</div>
          <h3>Login Required</h3>
          <p>Please log in to your TechCart account to view your order history.</p>
          <Link to="/login?redirect=/orders" className="primary-button">
            Login to Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>
          Showing purchase history for <strong>{user?.name}</strong> ({user?.email})
        </p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Fetching your order records from database...</p>
        </div>
      ) : error ? (
        <div className="error-alert">
          <p>Error loading orders: {error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders-card">
          <div className="empty-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p>
            You haven't placed any orders yet. Once you make a purchase, it will appear here.
          </p>
          <Link to="/products" className="primary-button">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-header-left">
                  <span className="order-id">Order #TC-{order.id}</span>
                  <span className="order-date">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="order-header-right">
                  <span className={`status-pill ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="order-card-items">
                {order.items &&
                  order.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <img src={item.image} alt={item.name} className="order-item-thumb" />
                      <div className="order-item-info">
                        <h4>{item.name}</h4>
                        <p className="order-item-cat">{item.category}</p>
                        <p className="order-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <div className="order-item-price">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="order-card-footer">
                <div className="order-shipping-summary">
                  <span className="shipping-label">Ship to:</span>
                  <span className="shipping-val">{order.shippingAddress}</span>
                </div>
                <div className="order-total-summary">
                  <span>Total Amount:</span>
                  <span className="order-grand-total">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
