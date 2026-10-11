import { createContext, useContext, useState, useEffect } from "react";

// 1. Create the Context object
const CartContext = createContext();

// 2. Create the Provider component
export function CartProvider({ children }) {
  // Initialize cart from localStorage if available, otherwise empty array
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("techcart_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("techcart_cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cart]);

  // Add product to cart with duplicate prevention
  function addToCart(product, quantityToAdd = 1) {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        // If product already in cart, increment quantity
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      } else {
        // If product not in cart, add with specified quantity (default 1)
        return [
          ...prevCart,
          {
            ...product,
            quantity: quantityToAdd,
          },
        ];
      }
    });
  }

  // Increase item quantity by 1
  function increaseQuantity(productId) {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  // Decrease item quantity by 1 (minimum 1)
  function decreaseQuantity(productId) {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  }

  // Remove item completely from cart
  function removeFromCart(productId) {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }

  // Clear entire cart (e.g. after successful checkout)
  function clearCart() {
    setCart([]);
  }

  // Calculate total number of items in cart
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Calculate total price of all items in cart
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Context value bundle
  const value = {
    cart,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    cartCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// 3. Custom hook for consuming the CartContext easily
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
