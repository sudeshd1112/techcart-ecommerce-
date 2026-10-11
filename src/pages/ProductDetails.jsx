import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fetchProductById } from "../services/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchProductById(id)
      .then((data) => {
        if (isMounted) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="not-found-page">
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="primary-button">
          Back to Products
        </Link>
      </div>
    );
  }

  function handleAddToCart() {
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  }

  return (
    <div className="product-details-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <Link to="/products">Products</Link> &gt;{" "}
        <span>{product.name}</span>
      </div>

      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      <div className="product-details-container">
        <div className="product-details-image-box">
          <img src={product.image} alt={product.name} className="product-details-image" />
        </div>

        <div className="product-details-info">
          <div className="product-category-badge">{product.category}</div>
          <h1 className="product-details-title">{product.name}</h1>
          <div className="rating-badge">⭐ {product.rating} / 5.0 Rating</div>

          <div className="product-details-price">
            <span className="current-price-lg">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.oldPrice && (
              <>
                <span className="old-price-lg">
                  ₹{product.oldPrice.toLocaleString("en-IN")}
                </span>
                <span className="discount-tag">
                  {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <p className="product-details-description">{product.description}</p>

          <div className="quantity-selector-container">
            <label htmlFor="qty">Quantity:</label>
            <div className="qty-picker">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span id="qty">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="details-actions">
            <button className="primary-button add-cart-large" onClick={handleAddToCart}>
              🛒 Add to Cart
            </button>
            <Link to="/cart" className="secondary-button view-cart-btn">
              Go to Cart
            </Link>
          </div>

          {addedNotice && (
            <div className="added-alert">
              ✅ Added {quantity} × {product.name} to your cart!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
