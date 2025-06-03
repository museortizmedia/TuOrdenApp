import React, { useState, useEffect, useRef } from "react";
import { useRestaurant } from "../contexts/RestaurantContext";
import { ShoppingCartIcon } from "lucide-react";
import CartOverlay from "../components/CartOverlay";
import { useAuth } from "../contexts/AuthContext";
import theme from "../theme";
import { useCart } from "../contexts/CartContext";

export default function CartaLayout({ children }) {
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

      // Detectar swipe desde el borde derecho (inicio cerca del borde y movimiento hacia la izquierda)
      if (
        touchStartX.current > window.innerWidth - 50 && // inicio cerca del borde derecho
        deltaX > 50 && // movimiento hacia la izquierda
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
        <ShoppingCartIcon className="w-6 h-6" />
      </button>

      {/* Contenido principal margin para no solapar el menu */}
      <main className="px-10 md:px-20 mt-15">{children}</main>

      {/* Overlay del carrito */}
      {isCartOpen && (
        <CartOverlay onClose={() => setIsCartOpen(false)} />
      )}
    </div>
  );
}