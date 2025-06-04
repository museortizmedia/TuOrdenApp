import React, { useState, useEffect, useRef } from "react";
import { useRestaurant } from "../contexts/RestaurantContext";
import { ShoppingCartIcon } from "lucide-react";
import CartOverlay from "./CartOverlay";
import { useAuth } from "../contexts/AuthContext";
import theme from "../theme";
import { useCart } from "../contexts/CartContext";

export default function RestaurantLayout({ children }) {
  const { restaurant } = useRestaurant();
  const { user } = useAuth();
  const { justAdded } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.changedTouches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      touchEndX.current = e.changedTouches[0].clientX;
      const deltaX = touchStartX.current - touchEndX.current;

      if (
        touchStartX.current > window.innerWidth - 50 &&
        deltaX > 50 &&
        !isCartOpen
      ) {
        setIsCartOpen(true);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isCartOpen]);

  // 🛒 Icono del carrito con badges y animaciones
  const ShoppingIcon = () => {
    const { cart, justAdded } = useCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div className="relative">
        {/* Icono principal */}
        <ShoppingCartIcon className="w-6 h-6" />

        {/* Badge de cantidad */}
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
            {totalItems}
          </span>
        )}

        {/* Toast animado "¡Añadido!" */}
        {justAdded && (
          <span className="absolute -top-8 right-0 bg-red-500 text-white text-[10px] px-2 py-1 rounded shadow animate-pulse">
            ¡Añadido!
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`${theme.colors.background.dark} relative min-h-screen`}>
      {/* Header */}
      <header className={`${theme.colors.background.dark} fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 shadow-md`}>
        <div className="flex items-center space-x-2">
          <img src={restaurant.logo} alt="Logo" className="h-8 w-auto" />
          <p>{restaurant.name}</p>
        </div>
      </header>

      {/* Botón flotante del carrito */}
      <button
        onClick={() => setIsCartOpen(true)}
        className={`
          fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-transform
          bg-yellow-400 hover:bg-yellow-500 text-black
          ${justAdded ? "animate-bounce" : ""}
        `}
      >
        <ShoppingIcon />
      </button>

      {/* Contenido principal */}
      <main className="px-10 md:px-20 mt-15">{children}</main>

      {/* Carrito Overlay */}
      {isCartOpen && <CartOverlay onClose={() => setIsCartOpen(false)} />}
    </div>
  );
}