import React, { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

export default function CartOverlay({ onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Mostrar con animación al montar
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Detectar swipe hacia la derecha
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchEndX.current - touchStartX.current;
    if (diff > 50) handleClose(); // Deslizó hacia la derecha
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-500 flex justify-end"
      onClick={handleClose}
    >
      <div
        className={`
          w-70 max-w-md h-full bg-white text-black p-6 relative shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isVisible ? "translate-x-0" : "translate-x-full"}
        `}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Tu carrito</h2>

        {/* Contenido del carrito */}
        <p>Aquí irán los productos seleccionados...</p>
      </div>
    </div>
  );
}