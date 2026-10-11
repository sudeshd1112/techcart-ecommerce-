import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function ProductCard({ product, onAddToCart }) {
  const { addToCart } = useCart();

  function handleAddToCart() {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product);
    }
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
      </Link>

      <div className="product-info">
        <div className="product-category">
          <span>{product.category}</span>
          <span className="rating">⭐ {product.rating}</span>
        </div>

        <h3>
          <Link to={`/products/${product.id}`} className="product-title-link">
            {product.name}
          </Link>
        </h3>

        <p className="product-description">{product.description}</p>

        <div className="product-price">
          <span className="current-price">
            ₹{product.price.toLocaleString("en-IN")}
          </span>

          <span className="old-price">
            ₹{product.oldPrice.toLocaleString("en-IN")}
          </span>
        </div>

        <button className="add-cart-button" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
