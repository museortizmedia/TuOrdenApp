import React, { useState, useEffect, useRef } from "react";
import { useRestaurant } from "../contexts/RestaurantContext";
import { ChevronUpIcon, ConciergeBellIcon, ListOrderedIcon, ShoppingCartIcon } from "lucide-react";
import CartOverlay from "./CartOverlay";
import { useAuth } from "../contexts/AuthContext";
import theme from "../theme";
import { useCart } from "../contexts/CartContext";
import ToggleSound from "./ToggleSound";
import audioService from "../servicies/audio";

export default function RestaurantLayout({ children }) {
  const { restaurant } = useRestaurant();
  const { user } = useAuth();
  const { activeOrders } = useCart();
  const { justAdded } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isActiveOrderFirst, setIsActiveOrderFirst] = useState(false);

  // Gestos APERTURA
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.changedTouches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      touchEndX.current = touch.clientX;

      const deltaX = touchStartX.current - touchEndX.current;
      const startedNearRightEdge = touchStartX.current > window.innerWidth - 50;
      const startedInBottomHalf = touchStartY.current > window.innerHeight / 2;

      if (
        startedNearRightEdge &&
        startedInBottomHalf &&
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
    <div className={`${theme.colors.background.dark} relative [min-height:100dvh] w-full max-w-[100vw] overflow-x-hidden`}>
      {/* Header */}
      <header className={`${theme.colors.background.dark} fixed top-0 left-0 right-0 z-50 flex items-center h-20 px-4 sm:px-6 shadow-md justify-between`}>
        <div className="flex items-center space-x-2" title={restaurant.desc}>
          <img
            src={restaurant.logo}
            alt={"Logo de " + restaurant.name}
            className="w-[32px] h-[32px] object-cover rounded"
          />
          <p className="text-white text-sm sm:text-base">{restaurant.name}</p>
        </div>

        <div
          className="relative w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200 active:scale-105 hover:scale-105 cursor-pointer"
          onClick={() => {
            setIsCartOpen(true);
            setIsActiveOrderFirst(true);
            audioService.play("alert");
          }}
          title="Rastrear pedidos"
        >
          <ConciergeBellIcon className="w-full h-full text-white" />

          {activeOrders.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full leading-none">
              {activeOrders.length}
            </span>
          )}
        </div>

      </header>

      {/* Sound control */}
      <div className="fixed bottom-4 left-[1.1rem] z-10 flex items-center"><ToggleSound /></div>

      {/* Go top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`
        fixed bottom-16 left-4 z-50 p-2 rounded-full shadow-lg
        bg-gray-800 hover:bg-gray-700 text-white
        transition-transform duration-200 active:scale-105 hover:scale-105 cursor-pointer
      `}
        style={{ transform: "translateZ(0)" }}
        aria-label="Volver arriba"
      >
        <ChevronUpIcon className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>


      {/* Floating cart button (always visible) */}
      <button
        onClick={() => { setIsCartOpen(true); setIsActiveOrderFirst(false); audioService.play("alert2") }}
        className={`
          fixed bottom-5 right-5 z-50 p-4 sm:p-4 rounded-full shadow-lg 
          bg-yellow-400 hover:bg-yellow-500 text-black
          ${justAdded ? "animate-bounce" : ""}
          transition-transform duration-200 active:scale-105 hover:scale-105 cursor-pointer
        `}
        style={{ transform: "translateZ(0)" }} // Fix visual glitches in some mobile browsers
        aria-label="Abrir carrito"
      >
        <ShoppingIcon />
      </button>

      {/* Main content area with safe padding */}
      <main className="pb-28 px-4 sm:px-6 md:px-10">
        {children}
      </main>

      {/* Cart Overlay */}
      {isCartOpen && <CartOverlay onClose={() => setIsCartOpen(false)} firstActiveOrders={isActiveOrderFirst} />}

      {/* FOOTER */}
      <div className="bg-[#050505] h-80 w-full"></div>
    </div>
  );
}