import React, { useEffect, useState, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useRestaurant } from "../contexts/RestaurantContext";
import { db } from "../firebase/firebase";
import { doc, runTransaction, collection, getDocs } from "firebase/firestore";
import MyOrders from "../pages/client/MyOrders";

export default function CartOverlay({ onClose }) {
  const { restaurant } = useRestaurant();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addActiveOrder,
    activeOrders,
    clearActiveOrders
  } = useCart();

  const [isVisible, setIsVisible] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [orderType, setOrderType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedSede, setSelectedSede] = useState("");
  const [sedes, setSedes] = useState([]);
  const [inputQuantities, setInputQuantities] = useState({});
  const [showTransferModal, setShowTransferModal] = useState(false);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const neighborhoodOptions = {
    Centro: 2000,
    Norte: 3000,
    Sur: 2500,
    Oriente: 3500,
    Occidente: 3000,
  };

  const orderOptions = {
    Domicilio: "Pagas cuando llegue a tu casa",
    Recoger: "Pagas en el local",
  };

  const paymentOptions = {
    Efectivo: "Pagar al finalizar",
    Transferencia: "Pagar por transferencia"
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = orderType === "Domicilio" ? (neighborhoodOptions[neighborhood] || 0) : 0;
  const total = subtotal + deliveryFee;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const submitOrder = async ({ status }) => {
    if (!restaurant?.id) return;

    const year = new Date().getFullYear();
    const restaurantId = restaurant.id;
    const counterDocRef = doc(db, `restaurants/${restaurantId}/counters/${year}`);

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
      phoneNumber,
      orderType,
      paymentMethod,
      status,
      sede: orderType === "Recoger" ? selectedSede : "",
    };

    const newOrderId = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);
      let current = counterDoc.exists() ? counterDoc.data().count || 0 : 0;
      const next = current + 1;
      const orderId = `${year}${String(next).padStart(4, "0")}`;

      transaction.set(counterDocRef, { count: next }, { merge: true });
      const orderRef = doc(db, `restaurants/${restaurantId}/ordenes/${orderId}`);
      transaction.set(orderRef, orderData);
      return orderId;
    });

    if (navigator.vibrate) navigator.vibrate(150);
    addActiveOrder({ id: newOrderId, ...orderData });
    clearCart();
    handleClose();
    return newOrderId;
  };

  const handleCheckout = async () => {
    if (!buyerName || !phoneNumber || !orderType || !paymentMethod) { console.log(buyerName, phoneNumber, orderType, paymentMethod); return;}
    if (orderType === "Domicilio" && (!address || !neighborhood)) { console.log(address, neighborhood); return;}
    if (orderType === "Recoger" && !selectedSede) { console.log(selectedSede); return;}

    if (paymentMethod === "Transferencia") {
      setShowTransferModal(true);
      return;
    }

    try {
      await submitOrder({ status: "pendiente" });
    } catch (err) {
      console.error("Error al enviar la orden:", err);
    }
  };

  const handleFinalTransferCheckout = async () => {
    try {
      return await submitOrder({ status: "por pagar" });
    } catch (err) {
      console.error("Error al finalizar transferencia:", err);
    }
  };

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, []);

  // Local user data
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedBuyer = JSON.parse(localStorage.getItem("buyerInfo") || "{}");
    setBuyerName(savedBuyer.buyerName || "");
    setAddress(savedBuyer.address || "");
    setNeighborhood(savedBuyer.neighborhood || "");
    setPhoneNumber(savedBuyer.phoneNumber || "");
    setOrderType(savedBuyer.orderType || "");
    setPaymentMethod(savedBuyer.paymentMethod || "");
    setSelectedSede(savedBuyer.selectedSede || "");
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(
      "buyerInfo",
      JSON.stringify({
        buyerName,
        address,
        neighborhood,
        phoneNumber,
        orderType,
        paymentMethod,
        selectedSede,
      })
    );
  }, [buyerName, address, neighborhood, phoneNumber, orderType, paymentMethod, selectedSede, isInitialized]);

  useEffect(() => {
    const initial = {};
    cart.forEach((item) => {
      initial[item.id] = item.quantity.toString();
    });
    setInputQuantities(initial);
  }, [cart]);

  useEffect(() => {
    const fetchSedes = async () => {
      if (!restaurant?.id) return;
      const snapshot = await getDocs(collection(db, `restaurants/${restaurant.id}/sedes`));
      const fetchedSedes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSedes(fetchedSedes);
    };
    fetchSedes();
  }, [restaurant]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    if (touchEndX.current - touchStartX.current > 50) handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[500] flex justify-end" onClick={handleClose}>
      <a
        href={restaurant.whatsapp.slice(0, 26)}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-6 left-6 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-lg z-50 animate-pulse"
      >
        💬 Asesoría
      </a>

      <div
        className={`
          w-4/5 sm:w-3/5 md:w-1/4 max-w-none h-full bg-white text-black p-6 relative shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isVisible ? "translate-x-0" : "translate-x-full"}
          overflow-y-auto
        `}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">Tu carrito</h2>

        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-1">
          {cart.length === 0 ? (
            <p className="text-gray-500">Tu carrito está vacío.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-start gap-4 border-b pb-4 pr-2">
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
                      min="1"
                      value={inputQuantities[item.id] ?? item.quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        setInputQuantities((prev) => ({ ...prev, [item.id]: value }));
                      }}
                      onBlur={() => {
                        const raw = inputQuantities[item.id];
                        const num = Number(raw);
                        if (raw === "0") return removeFromCart(item.id);
                        if (!raw || isNaN(num) || num <= 0) {
                          setInputQuantities((prev) => ({ ...prev, [item.id]: "1" }));
                          return updateQuantity(item.id, 1);
                        }
                        updateQuantity(item.id, num);
                      }}
                      className="w-14 border rounded text-center text-sm"
                    />
                    <button onClick={() => { removeFromCart(item.id); navigator.vibrate?.(100); }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="text-right font-semibold text-sm whitespace-nowrap">
                  ${(item.price * item.quantity).toLocaleString("es-CL")}
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="mt-6 space-y-4">
            <input type="text" placeholder="Nombre" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" />
            <input type="tel" placeholder="Número de teléfono" value={phoneNumber} onChange={(e) => (/^3\d{0,9}$/.test(e.target.value) || e.target.value === "") && setPhoneNumber(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" />
            <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="w-full border px-3 py-2 rounded text-sm">
              <option value="">Tipo de orden</option>
              {Object.entries(orderOptions).map(([key, val]) => <option key={key} value={key}>{key}: {val}</option>)}
            </select>

            {orderType === "Domicilio" && (
              <>
                <input type="text" placeholder="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" />
                <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="w-full border px-3 py-2 rounded text-sm">
                  <option value="">Selecciona un barrio</option>
                  {Object.entries(neighborhoodOptions).map(([key, price]) => <option key={key} value={key}>{key} (${price})</option>)}
                </select>
              </>
            )}

            {orderType === "Recoger" && (
              <select
                value={selectedSede}
                onChange={(e) => setSelectedSede(e.target.value)}
                className="w-full border px-3 py-2 rounded text-sm"
              >
                <option value="">Selecciona una sede</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={`${sede.name} - ${sede.address} - ${sede.telefono}`}>
                    {sede.name} - {sede.address}
                  </option>
                ))}
              </select>
            )}

            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border px-3 py-2 rounded text-sm">
              <option value="">Método de pago</option>
              {Object.entries(paymentOptions).map(([key, val]) => <option key={key} value={key}>{key}: {val}</option>)}
            </select>

            <div className="flex justify-between text-lg"><span>Subtotal</span><span>${subtotal.toLocaleString("es-CL")}</span></div>
            <div className="flex justify-between text-sm"><span>IVA</span><span>$0</span></div>
            <div className="flex justify-between text-sm"><span>Domicilio</span><span>${deliveryFee.toLocaleString("es-CL")}</span></div>
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>${total.toLocaleString("es-CL")}</span></div>

            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded" onClick={handleCheckout}>Pagar</button>
            <button className="w-full text-sm text-gray-500 underline" onClick={clearCart}>Vaciar carrito</button>
          </div>
        )}

        {activeOrders.length > 0 && (
          <div className="w-full max-h-96 overflow-y-auto p-4 my-2 bg-white/90 rounded-xl shadow space-y-5">
            <h3 className="text-xl font-bold text-gray-800">Órdenes Activas</h3>
            <div className="mb-6"><MyOrders /></div>
            <button className="w-full text-sm text-gray-500 underline" onClick={clearActiveOrders}>Vaciar órdenes activas</button>
          </div>
        )}
      </div>

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm text-center space-y-4 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Transferencia pendiente</h3>
            <p className="text-sm text-gray-700">Tu pedido será enviado, pero no se preparará hasta que realices la transferencia.</p>
            <div className="flex flex-col space-y-2">
              <button className="bg-gray-200 hover:bg-gray-300 text-black py-2 rounded" onClick={() => setShowTransferModal(false)}>Cambiar tipo de orden</button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white py-2 rounded"
                onClick={async (e) => {
                  e.stopPropagation();
                  setShowTransferModal(false);
                  const newOrderId = await handleFinalTransferCheckout();
                  if (newOrderId) {
                    const whatsapp = restaurant.whatsapp.slice(0, 26).replace("https://wa.me/", "");
                    const msg = `Hola, quiero pagar mi pedido ${newOrderId} por transferencia.`;
                    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
                  }
                }}
              >
                Pagar por transferencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}