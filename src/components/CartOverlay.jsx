import React, { useEffect, useState, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";

export default function CartOverlay({ onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchEndX.current - touchStartX.current;
    if (diff > 50) handleClose();
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[500] flex justify-end"
      onClick={handleClose}
    >
      <div
        className={`
          w-80 max-w-md h-full bg-white text-black p-6 relative shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isVisible ? "translate-x-0" : "translate-x-full"}
        `}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">Tu carrito</h2>

        {/* Listado de productos */}
        <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-1">
          {cart.length === 0 ? (
            <p className="text-gray-500">Tu carrito está vacío.</p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 border-b pb-4"
              >
                <img
                  src={item.image || "https://placehold.co/100"}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />

                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-600">{item.desc}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value <= 0) removeFromCart(item.id);
                        else updateQuantity(item.id, value);
                      }}
                      className="w-14 border rounded text-center text-sm"
                    />
                    <button onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="text-right font-semibold text-sm whitespace-nowrap">
                  ${item.price * item.quantity}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total y pagar */}
        {cart.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toLocaleString('es-CL')}</span>
            </div>
            <button
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded"
              onClick={() => alert("Implementar lógica de pago")}
            >
              Pagar
            </button>
            <button
              className="w-full text-sm text-gray-500 underline"
              onClick={clearCart}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
