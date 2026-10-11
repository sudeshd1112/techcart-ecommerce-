function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const itemSubtotal = item.price * item.quantity;

  return (
    <div className="cart-item">
      <div className="cart-item-image-box">
        <img src={item.image} alt={item.name} className="cart-item-image" />
      </div>

      <div className="cart-item-details">
        <h4 className="cart-item-name">{item.name}</h4>
        <p className="cart-item-category">{item.category}</p>
        <p className="cart-item-price">₹{item.price.toLocaleString("en-IN")}</p>
      </div>

      <div className="cart-item-quantity-controls">
        <button
          className="qty-btn"
          onClick={() => onDecrease(item.id)}
          disabled={item.quantity <= 1}
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="qty-value">{item.quantity}</span>
        <button
          className="qty-btn"
          onClick={() => onIncrease(item.id)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <div className="cart-item-subtotal">
        <span className="subtotal-label">Subtotal:</span>
        <span className="subtotal-amount">₹{itemSubtotal.toLocaleString("en-IN")}</span>
      </div>

      <div className="cart-item-remove">
        <button
          className="remove-btn"
          onClick={() => onRemove(item.id)}
          aria-label="Remove item"
        >
          🗑️ Remove
        </button>
      </div>
    </div>
  );
}

export default CartItem;
