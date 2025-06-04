import React, { useEffect, useState, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useRestaurant } from "../contexts/RestaurantContext";

import { db } from "../firebase/firebase";
import { doc, runTransaction } from "firebase/firestore";

export default function CartOverlay({ onClose }) {
  const { restaurant } = useRestaurant();

  const [isVisible, setIsVisible] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart();

  // Objeto de barrios y precios (editable)
  const neighborhoodOptions = {
    Centro: 2000,
    Norte: 3000,
    Sur: 2500,
    Oriente: 3500,
    Occidente: 3000,
  };

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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = neighborhoodOptions[neighborhood] || 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!buyerName || !address || !neighborhood) {
      alert("Por favor completa los datos del comprador.");
      return;
    }

    if (!restaurant?.id) {
      alert("Restaurante no cargado.");
      return;
    }

    const year = new Date().getFullYear();
    const restaurantId = restaurant.id;
    const counterDocRef = doc(db, `restaurants/${restaurantId}/counters/${year}`);

    try {
      const newOrderId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterDocRef);
        let current = 0;

        if (counterDoc.exists()) {
          current = counterDoc.data().count || 0;
        }

        const next = current + 1;
        const padded = String(next).padStart(4, '0');
        const orderId = `${year}${padded}`;

        transaction.set(counterDocRef, { count: next }, { merge: true });

        const orderRef = doc(db, `restaurants/${restaurantId}/ordenes/${orderId}`);
        const orderData = {
          createdAt: new Date(),
          items: cart,
          subtotal,
          tax: 0,
          deliveryFee,
          total,
          buyerName,
          address,
          neighborhood,
          status: 'pendiente'
        };

        transaction.set(orderRef, orderData);
        return orderId;
      });

      alert(`Orden enviada con éxito. ID: ${newOrderId}`);
      clearCart();
      handleClose();
    } catch (error) {
      console.error("Error al crear la orden:", error);
      alert("Error al enviar la orden.");
    }
  };


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
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">Tu carrito</h2>

        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-1">
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

        {cart.length > 0 && (
          <div className="mt-6 space-y-4">
            {/* Inputs del comprador */}
            <input
              type="text"
              placeholder="Nombre"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Dirección"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            />
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            >
              <option value="">Selecciona un barrio</option>
              {Object.entries(neighborhoodOptions).map(([key, price]) => (
                <option key={key} value={key}>
                  {key} (${price})
                </option>
              ))}
            </select>

            {/* Totales */}
            <div className="flex justify-between text-lg">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IVA</span>
              <span>$0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Domicilio</span>
              <span>${deliveryFee.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${total.toLocaleString('es-CL')}</span>
            </div>

            <button
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded"
              onClick={handleCheckout}
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