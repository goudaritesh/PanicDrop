import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('panicdrop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem('panicdrop_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const pId = product._id || product.id || product.product;
      const existing = prevItems.find((item) => (item._id || item.id || item.product) === pId);
      if (existing) {
        return prevItems.map((item) =>
          (item._id || item.id || item.product) === pId
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || 99) }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            _id: pId,
            id: pId,
            product: pId,
            name: product.name,
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : Number(product.price),
            image: Array.isArray(product.images) ? product.images[0] : product.image || '',
            images: Array.isArray(product.images) ? product.images : [product.image || ''],
            stock: product.stock !== undefined ? product.stock : 99,
            quantity: Math.min(quantity, product.stock || 99),
            category: product.category,
            brand: product.brand,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => (item._id || item.id || item.product) !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if ((item._id || item.id || item.product) === productId) {
          return { ...item, quantity: Math.min(quantity, item.stock || 99) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    setDiscountPercent(0);
  };

  const applyCoupon = (code) => {
    const formatted = code.trim().toUpperCase();
    if (formatted === 'DESI20' || formatted === 'PANIC20') {
      setCoupon({ code: formatted, discountPercent: 20 });
      setDiscountPercent(20);
      return { success: true, message: '🎉 20% Indian Festive Discount Applied!' };
    } else if (formatted === 'INDIA10' || formatted === 'DROP10') {
      setCoupon({ code: formatted, discountPercent: 10 });
      setDiscountPercent(10);
      return { success: true, message: '🎉 10% Welcome Bharat Discount Applied!' };
    } else if (formatted === 'FREESHIP') {
      setCoupon({ code: 'FREESHIP', discountPercent: 5 });
      setDiscountPercent(5);
      return { success: true, message: '🚚 Free Express Shipping Coupon Applied!' };
    } else {
      return { success: false, message: 'Invalid or expired coupon code. Try DESI20' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscountPercent(0);
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const getDiscountAmount = () => {
    return Math.round((getSubtotal() * discountPercent) / 100);
  };

  const getShippingFee = () => {
    const subtotal = getSubtotal();
    return subtotal > 499 || subtotal === 0 ? 0 : 49;
  };

  const getTaxAmount = () => {
    return Math.round((getSubtotal() - getDiscountAmount()) * 0.18);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = getDiscountAmount();
    const shipping = getShippingFee();
    return Math.max(0, subtotal - discount + shipping);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        coupon,
        discountPercent,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        getCartCount,
        getSubtotal,
        getCartSubtotal: getSubtotal,
        getDiscountAmount,
        getShippingFee,
        getTaxAmount,
        getTotal,
        getCartTotal: getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
