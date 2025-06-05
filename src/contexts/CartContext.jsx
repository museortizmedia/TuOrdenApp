import React, { createContext, useContext, useEffect, useState } from "react";
import { useRestaurant } from "./RestaurantContext";
import firestoreService from "../servicies/firestoreService";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  const [justAdded, setJustAdded] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);
  const { restaurant } = useRestaurant();

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Escuchar en tiempo real las órdenes activas del cliente
  useEffect(() => {
    if (!restaurant?.id) return;

    const unsub = firestoreService.listenSubcollection(
      "restaurants",
      restaurant.id,
      "ordenes",
      (allOrders) => {
        const myOrderIds = JSON.parse(localStorage.getItem("myOrderIds") || "[]");
        const myOrders = allOrders.filter((order) => myOrderIds.includes(order.id));
        setActiveOrders(myOrders);
      }
    );

    return () => unsub();
  }, [restaurant?.id]);

  // ✅ Añadir orden activa (memoria + localStorage)
  const addActiveOrder = (order) => {
    setActiveOrders((prev) => [...prev, order]);

    const existingIds = JSON.parse(localStorage.getItem("myOrderIds") || "[]");

    if (!existingIds.includes(order.id)) {
      const updatedIds = [...existingIds, order.id];
      localStorage.setItem("myOrderIds", JSON.stringify(updatedIds));
    }
  };

  // ❌ Limpiar órdenes activas (memoria + localStorage)
  const clearActiveOrders = () => {
    setActiveOrders([]);
    localStorage.removeItem("myOrderIds");
  };

  // Añadir producto al carrito
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  // Remover producto del carrito
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Cambiar cantidad
  const updateQuantity = (id, quantity) => {

    // Evita eliminar si es undefined, null, o cero temporal desde input vacío
    if (quantity === "" || quantity === null || isNaN(quantity)) {
      return;
    }

    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  // Vaciar carrito
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        justAdded,
        activeOrders,
        addActiveOrder,
        clearActiveOrders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
