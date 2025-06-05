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

  const ShoppingIcon = () => {
    const { cart, justAdded } = useCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div className="relative w-6 h-6 sm:w-7 sm:h-7">
        <ShoppingCartIcon className="w-full h-full" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full leading-none">
            {totalItems}
          </span>
        )}
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
      <header className={`${theme.colors.background.dark} fixed top-0 left-0 right-0 z-50 flex items-center h-20 px-4 sm:px-6 shadow-md`}>
        <div className="flex items-center space-x-2">
          <img src={restaurant.logo} alt="Logo" className="h-8 w-auto" />
          <p className="text-white text-sm sm:text-base">{restaurant.name}</p>
        </div>
      </header>

      {/* Floating cart button (always visible) */}
      <button
        onClick={() => setIsCartOpen(true)}
        className={`
          fixed bottom-4 right-4 z-50 p-3 sm:p-4 rounded-full shadow-lg transition-transform
          bg-yellow-400 hover:bg-yellow-500 text-black
          ${justAdded ? "animate-bounce" : ""}
          hover:animate-pulse cursor-pointer
        `}
        style={{ transform: "translateZ(0)" }} // Fix visual glitches in some mobile browsers
        aria-label="Abrir carrito"
      >
        <ShoppingIcon />
      </button>

      {/* Main content area with safe padding */}
      <main className="pt-20 pb-28 px-4 sm:px-6 md:px-10">
        {children}
      </main>

      {/* Cart Overlay */}
      {isCartOpen && <CartOverlay onClose={() => setIsCartOpen(false)} />}
    </div>
  );
}