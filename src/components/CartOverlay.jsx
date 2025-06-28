import React, { useEffect, useState, useRef } from "react";
import { X, Trash2, AlertCircle, Banknote, ArrowLeft, Send, Check } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useRestaurant } from "../contexts/RestaurantContext";
import { db } from "../firebase/firebase";
import { doc, runTransaction, collection, getDocs } from "firebase/firestore";
import MyOrders from "../pages/client/MyOrders";
import { Toaster, toast } from "react-hot-toast";
import audioService from "../servicies/audio";
import AutocompleteSelect from "./AutocompleteSelect";

export default function CartOverlay({ onClose, firstActiveOrders = false }) {
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
  const [observaciones, setObservaciones] = useState("");
  const [sedes, setSedes] = useState([]);
  const [inputQuantities, setInputQuantities] = useState({});
  const [showTransferModal, setShowTransferModal] = useState(false);

  const neighborhoodOptions = [
    { value: "ciudadela_del_viento", label: "CIUDADELA DEL VIENTO", price: 11000 },
    { value: "urbanizacion_alamadina", label: "URBANIZACION ALAMADINA", price: 11000 },
    { value: "oasis_de_terranova", label: "OASIS DE TERRANOVA", price: 11000 },
    { value: "marbella", label: "MARBELLA", price: 11000 },
    { value: "san_isidro", label: "SAN ISIDRO", price: 11000 },
    { value: "terranova", label: "TERRANOVA", price: 11000 },
    { value: "cr_molinos_de_terranova", label: "CR. MOLINOS DE TERRANOVA", price: 11000 },
    { value: "paisaje_de_las_flores", label: "PAISAJE DE LAS FLORES", price: 11000 },
    { value: "bonanza", label: "BONANZA", price: 11000 },
    { value: "cond_eden_del_parque", label: "COND. EDEN DEL PARQUE", price: 11000 },
    { value: "las_flores", label: "LAS FLORES", price: 11000 },
    { value: "almendros_de_belicia", label: "ALMENDROS DE BELICIA", price: 10000 },
    { value: "canto_verde", label: "CANTO VERDE", price: 10000 },
    { value: "galicia", label: "GALICIA", price: 10000 },
    { value: "villa_del_rio", label: "VILLA DEL RIO", price: 10000 },
    { value: "bosque_encantado_del_sur", label: "BOSQUE ENCANTADO DEL SUR", price: 10000 },
    { value: "condominios_de_la_morada", label: "CONDOMINIOS DE LA MORADA", price: 8500 },
    { value: "tecnoquimicas", label: "TECNOQUIMICAS", price: 6000 },
    { value: "cinco_soles", label: "CINCO SOLES", price: 8500 },
    { value: "ciudad_country", label: "CIUDAD COUNTRY", price: 8500 },
    { value: "el_castillo", label: "EL CASTILLO", price: 11000 },
    { value: "condominio_saman_del_lago", label: "CONDOMINIO SAMÁN DEL LAGO", price: 6000 },
    { value: "quintas_de_bolivar", label: "QUINTAS DE BOLIVAR", price: 5000 },
    { value: "oporto", label: "OPORTO", price: 6000 },
    { value: "motel_vuelta_al_mundo", label: "MOTEL VUELTA AL MUNDO", price: 7000 },
    { value: "condominio_ciudad_de_dios", label: "CONDOMINIO CIUDAD DE DIOS", price: 7000 },
    { value: "ciudad_de_dios_2", label: "CIUDAD DE DIOS 2", price: 7000 },
    { value: "villa_pime", label: "VILLA PIME", price: 6000 },
    { value: "los_mangos", label: "LOS MANGOS", price: 6000 },
    { value: "las_margaritas", label: "LAS MARGARITAS", price: 6000 },
    { value: "urbanizacion_las_palmas", label: "URBANIZACION LAS PALMAS", price: 7000 },
    { value: "llano_grande", label: "LLANO GRANDE", price: 7000 },
    { value: "amigos_2000", label: "AMIGOS 2000", price: 6000 },
    { value: "callejon_juan_de_dios_las_pinas", label: "CALLEJON JUAN DE DIOS LAS PIÑAS", price: 7000 },
    { value: "corregimiento_paso_de_la_bolsa", label: "CORREGIMIENTO PASO DE LA BOLSA", price: 11000 },
    { value: "senderos_de_las_mercedes", label: "SENDEROS DE LAS MERCEDES", price: 9000 },
    { value: "villas_de_las_mercedes", label: "VILLAS DE LAS MERCEDES", price: 9000 },
    { value: "rincon_de_las_mercedes", label: "RINCON DE LAS MERCEDES", price: 9000 },
    { value: "fontana_de_las_mercedes", label: "FONTANA DE LAS MERCEDES", price: 9000 },
    { value: "hontanar_de_las_mercedes", label: "HONTANAR DE LAS MERCEDES", price: 9000 },
    { value: "manantial_de_las_mercedes", label: "MANANTIAL DE LAS MERCEDES", price: 9000 },
    { value: "las_mercedes", label: "LAS MERCEDES", price: 9000 },
    { value: "valle_del_rio", label: "VALLE DEL RIO", price: 9000 },
    { value: "valle_verde", label: "VALLE VERDE", price: 9000 },
    { value: "riberas_de_las_mercedes", label: "RIBERAS DE LAS MERCEDES", price: 9000 },
    { value: "tangelos", label: "TANGELOS", price: 9000 },
    { value: "casa_campo", label: "CASA CAMPO", price: 9000 },
    { value: "miralagos", label: "MIRALAGOS", price: 9000 },
    { value: "entrelagos", label: "ENTRELAGOS", price: 9000 },
    { value: "casazul", label: "CASAZUL", price: 9000 },
    { value: "casa_terra", label: "CASA TERRA", price: 9000 },
    { value: "portales_de_verde_horizonte", label: "PORTALES DE VERDE HORIZONTE", price: 12000 },
    { value: "verde_horizonte", label: "VERDE HORIZONTE", price: 12000 },
    { value: "senderos_de_verde_horizonte", label: "SENDEROS DE VERDE HORIZONTE", price: 12000 },
    { value: "praderas_de_verde_horizonte", label: "PRADERAS DE VERDE HORIZONTE", price: 12000 },
    { value: "bosques_de_verde_horizonte", label: "BOSQUES DE VERDE HORIZONTE", price: 12000 },
    { value: "guaduales_de_las_mercedes", label: "GUADUALES DE LAS MERCEDES", price: 12000 },
    { value: "remansos_del_jordan", label: "REMANSOS DEL JORDAN", price: 12000 },
    { value: "oceano_verde", label: "OCEANO VERDE", price: 12000 },
    { value: "miravalle_3", label: "MIRAVALLE 3", price: 12000 },
    { value: "colinas_de_miravalle", label: "COLINAS DE MIRAVALLE", price: 12000 },
    { value: "paseo_de_pangola", label: "PASEO DE PANGOLA", price: 6000 },
    { value: "caminos_de_pangola", label: "CAMINOS DE PANGOLA", price: 6000 },
    { value: "paisajes_de_pangola", label: "PAISAJES DE PANGOLA", price: 6000 },
    { value: "surcos_de_pangola", label: "SURCOS DE PANGOLA", price: 6000 },
    { value: "manzana_5_de_pangola", label: "MANZANA 5 DE PANGOLA", price: 6000 },
    { value: "invasion_la_playita", label: "INVASION LA PLAYITA", price: 6000 },
    { value: "palmetum_park_club_house", label: "PALMETUM PARK CLUB HOUSE", price: 6000 },
    { value: "los_naranjos", label: "LOS NARANJOS", price: 6000 },
    { value: "bio_ciudadela_la_reserva", label: "BIO CIUDADELA LA RESERVA", price: 6000 },
    { value: "conjunto_res_carbonero", label: "CONJUNTO RES. CARBONERO", price: 6000 },
    { value: "p_r_la_arboleda", label: "P.R. LA ARBOLEDA", price: 6000 },
    { value: "conjunto_res_bambu", label: "CONJUNTO RES. BAMBU", price: 6000 },
    { value: "condominio_koa", label: "CONDOMINIO KOA", price: 6000 },
    { value: "cr_hacienda_el_pino", label: "C.R. HACIENDA EL PINO", price: 6000 },
    { value: "parque_natura", label: "PARQUE NATURA", price: 6000 },
    { value: "cr_villas_de_altagracia", label: "CR VILLAS DE ALTAGRACIA", price: 6000 },
    { value: "torres_de_jamundi", label: "TORRES DE JAMUNDI", price: 6000 },
    { value: "conj_cerrado_portal_de_jamundi", label: "CONJ. CERRADO PORTAL DE JAMUNDI", price: 6000 },
    { value: "alameda_de_rio_claro", label: "ALAMEDA DE RIO CLARO", price: 6000 },
    { value: "cr_san_cayetano", label: "CR. SAN CAYETANO", price: 6000 },
    { value: "cr_parques_de_castilla_1", label: "CR. PARQUES DE CASTILLA 1", price: 5000 },
    { value: "cr_parques_de_castilla_2", label: "CR. PARQUES DE CASTILLA 2", price: 6000 },
    { value: "condominio_madeira", label: "CONDOMINIO MADEIRA", price: 6000 },
    { value: "siglo_xxi", label: "SIGLO XXI", price: 6000 },
    { value: "cr_alegra", label: "CR. ALEGRA", price: 6000 },
    { value: "cond_rincon_de_las_garzas", label: "COND. RINCON DE LAS GARZAS", price: 6000 },
    { value: "cond_prados_de_alfaguara", label: "COND. PRADOS DE ALFAGUARA", price: 6000 },
    { value: "country_plaza", label: "COUNTRY PLAZA", price: 6000 },
    { value: "la_ceibita", label: "LA CEIBITA", price: 5000 },
    { value: "la_arboleda", label: "LA ARBOLEDA", price: 5000 },
    { value: "portal_de_jamundi", label: "PORTAL DE JAMUNDI", price: 5000 },
    { value: "macunaima", label: "MACUNAIMA", price: 5000 },
    { value: "villa_paulina", label: "VILLA PAULINA", price: 5000 },
    { value: "el_socorro", label: "EL SOCORRO", price: 5000 },
    { value: "parques_de_castilla", label: "PARQUES DE CASTILLA", price: 5000 },
    { value: "las_acacias", label: "LAS ACACIAS", price: 5000 },
    { value: "la_hojarasca", label: "LA HOJARASCA", price: 5000 },
    { value: "juan_pablo_ii", label: "JUAN PABLO II", price: 5000 },
    { value: "palo_santo", label: "PALO SANTO", price: 5000 },
    { value: "cantabria", label: "CANTABRIA", price: 5000 },
    { value: "villa_estela", label: "VILLA ESTELA", price: 5000 },
    { value: "portal_del_jordan", label: "PORTAL DEL JORDAN", price: 5000 },
    { value: "rincon_de_zaragoza", label: "RINCON DE ZARAGOZA", price: 5000 },
    { value: "los_mandarinos", label: "LOS MANDARINOS", price: 5000 },
    { value: "villa_tatiana", label: "VILLA TATIANA", price: 5000 },
    { value: "el_piloto", label: "EL PILOTO", price: 5000 },
    { value: "cerezos_del_rosario", label: "CEREZOS DEL ROSARIO", price: 5000 },
    { value: "portal_del_saman", label: "PORTAL DEL SAMAN 1 Y 2", price: 5000 },
    { value: "villa_ema", label: "VILLA EMA", price: 5000 },
    { value: "santa_ana", label: "SANTA ANA", price: 5000 },
    { value: "villa_monica", label: "VILLA MONICA", price: 5000 },
    { value: "coliseo_indere", label: "COLISEO INDERE", price: 5000 },
    { value: "riberas_del_rosario", label: "RIBERAS DEL ROSARIO", price: 5000 },
    { value: "chipaya_plaza", label: "CHIPAYÁ PLAZA-LA GRAN COLOMBIA", price: 5000 },
    { value: "los_anturios", label: "LOS ANTURIOS", price: 5000 },
    { value: "brisas_de_farallones", label: "BRISAS DE FARALLONES", price: 5000 },
    { value: "recanto", label: "RECANTO", price: 5000 },
    { value: "ventino", label: "VENTINO", price: 5000 },
    { value: "condados_del_sur", label: "CONDADOS DEL SUR", price: 5000 },
    { value: "alborada", label: "ALBORADA 1 Y 2", price: 5000 },
    { value: "senderos_de_alfaguara", label: "SENDEROS DE ALFAGUARA", price: 5000 },
    { value: "brisas_del_rosario", label: "BRISAS DEL ROSARIO", price: 5000 },
    { value: "solar_de_las_garzas", label: "SOLAR DE LAS GARZAS", price: 5000 },
    { value: "rincon_de_las_garzas", label: "RINCON DE LAS GARZAS", price: 5000 },
    { value: "cc_alfaguara", label: "CC. ALFAGUARA", price: 5000 },
    { value: "villa_elvira", label: "VILLA ELVIRA", price: 5000 },
    { value: "villa_del_sol", label: "VILLA DEL SOL", price: 5000 },
    { value: "villa_maite", label: "VILLA MAITE", price: 5000 },
    { value: "callejon_coodinter", label: "CALLEJON COODINTER", price: 5000 },
    { value: "cazadores", label: "CAZADORES", price: 5000 },
    { value: "el_rosario", label: "EL ROSARIO", price: 5000 },
    { value: "sachamate", label: "SACHAMATE", price: 5000 },
    { value: "la_estacion", label: "LA ESTACION", price: 5000 },
    { value: "la_esmeralda", label: "LA ESMERALDA", price: 5000 },
    { value: "angel_maria_camacho", label: "ANGEL MARIA CAMACHO", price: 5000 },
    { value: "primero_de_mayo", label: "PRIMERO DE MAYO", price: 5000 },
    { value: "el_popular", label: "EL POPULAR", price: 5000 },
    { value: "el_porvenir", label: "EL PORVENIR", price: 5000 },
    { value: "parque_del_amor", label: "PARQUE DEL AMOR", price: 5000 },
    { value: "juan_de_ampudia", label: "JUAN DE AMPUDIA", price: 5000 },
    { value: "parque_principal", label: "PARQUE PRINCIPAL", price: 5000 },
    { value: "simon_bolivar", label: "SIMON BOLIVAR", price: 5000 },
    { value: "la_lucha", label: "LA LUCHA", price: 5000 },
    { value: "ciro_velasco", label: "CIRO VELASCO", price: 5000 },
    { value: "covicedros", label: "COVICEDROS", price: 5000 },
    { value: "la_pradera", label: "LA PRADERA", price: 5000 },
    { value: "la_esperanza", label: "LA ESPERANZA", price: 5000 },
    { value: "libertadores", label: "LIBERTADORES", price: 5000 },
    { value: "belalcazar", label: "BELALCAZAR 1 Y 2", price: 5000 },
    { value: "colegio_el_ceti", label: "COLEGIO EL CETI", price: 5000 },
    { value: "la_adrianita", label: "LA ADRIANITA", price: 5000 },
    { value: "la_aurora", label: "LA AURORA", price: 5000 },
    { value: "el_cotolengo", label: "EL COTOLENGO", price: 5000 },
    { value: "el_jardin", label: "EL JARDIN", price: 5000 },
    { value: "ciudad_sur", label: "CIUDAD SUR", price: 5000 },
    { value: "centenario", label: "CENTENARIO", price: 5000 },
    { value: "barriles_el_saman", label: "BARRILES- EL SAMAN", price: 5000 },
    { value: "bello_horizonte", label: "BELLO HORIZONTE", price: 5000 },
    { value: "el_panamericano", label: "EL PANAMERICANO", price: 5000 },
    { value: "alferez_real", label: "ALFEREZ REAL", price: 5000 }
  ];

  const orderOptions = {
    Domicilio: "¡Llévalo a mi casa!",
    Recoger: "Paso a buscarlo",
  };

  const paymentOptions = {
    Efectivo: "Pago en efectivo",
    Datafono: "Con tarjeta",
    Transferencia: "Por transferencia",
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedNeighborhood = neighborhoodOptions.find(option => option.value === neighborhood);
  const deliveryFee = orderType === "Domicilio" ? (selectedNeighborhood?.price || 0) : 0;
  const total = subtotal + deliveryFee;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
    audioService.play("autoInteract")
  };

  // Checkout
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
      observaciones,
      status,
      sede: orderType === "Recoger" ? selectedSede : "",
    };

    const newOrder = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);
      let current = counterDoc.exists() ? counterDoc.data().count || 0 : 0;
      const next = current + 1;
      const orderId = `${year}${String(next).padStart(4, "0")}`;

      transaction.set(counterDocRef, { count: next }, { merge: true });
      const orderRef = doc(db, `restaurants/${restaurantId}/ordenes/${orderId}`);
      transaction.set(orderRef, orderData);
      return { id: orderId, ...orderData };
    });
    addActiveOrder(newOrder);
    clearCart();
    //handleClose();
    return newOrder;
  };

  const isDisabled =
    !buyerName ||
    !phoneNumber ||
    !orderType ||
    !paymentMethod ||
    (orderType === "Domicilio" && (!address || !neighborhood)) ||
    (orderType === "Recoger" && !selectedSede);

  const handleCheckout = async () => {
    // Mostramos en pantalla los campos errados con showError
    setShowError(isDisabled);

    // Si hay errores mostramos la retroalimentacion y sonido y detenemos el checkout
    if (isDisabled) {
      toast.error("¡Ups! Completa los datos antes de hacer la orden 🧑‍🍳")
      audioService.play("negative");
      return;
    }

    // si es transferencia contiguar el checkout en modo modal de tranferencia
    if (paymentMethod === "Transferencia") {
      setShowTransferModal(true);
      audioService.play("manualInteract");
      return;
    }

    // Tratar de hacer la solitud al servidor
    try {
      await submitOrder({ status: "pendiente" });
      toast.success("¡Orden enviada a cocina exitosamente!");
      audioService.play("alert2");
    } catch (err) {
      console.error("Error al enviar la orden:", err);
      audioService.play("negative");
      toast.error("Error al enviar la orden a cocina.");
    }
  };

  const handleFinalTransferCheckout = async () => {
    try {
      return await submitOrder({ status: "por pagar" });
    } catch (err) {
      console.error("Error al finalizar transferencia:", err);
    }
  };

  const [confirmedTransfer, setConfirmedTransfer] = useState(false);

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
    setObservaciones(savedBuyer.observaciones || "");
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
        observaciones
      })
    );
  }, [buyerName, address, neighborhood, phoneNumber, orderType, paymentMethod, selectedSede, observaciones, isInitialized]);

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

  // Gestos CIERRE
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

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

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    if (touchEndX.current - touchStartX.current > 50) handleClose();
  };

  // Seguimiento de órdenes
  const [manualOrderId, setManualOrderId] = useState("");
  const manualOrderSuccessMessages = [
    "📦 ¡Pedido localizado!",
    "🚀 Seguimiento activado",
    "🛎️ ¡Vamos tras tu orden!",
    "😎 Pedido en camino",
    "🎯 Orden encontrada"
  ];
  const manualOrderErrorMessages = [
    "😕 No encontramos nada",
    "🚫 Orden no hallada",
    "🕵️ Sin resultados",
    "🤔 Revisá el número",
    "📭 Nada por aquí"
  ];

  const handleManualOrderAdd = () => {

    addActiveOrder({ id: manualOrderId.trim() })
      .then((order) => {
        //console.log("✅ Orden añadida", order);
        toast.success(manualOrderSuccessMessages[Math.floor(Math.random() * manualOrderSuccessMessages.length)]);
        audioService.play("alert2");
      })
      .catch((error) => {
        //console.warn("⚠️ Error al añadir la orden:", error.message);
        toast.error(manualOrderErrorMessages[Math.floor(Math.random() * manualOrderErrorMessages.length)]);
        audioService.play("negative");
      });

    setManualOrderId("");
  };

  // Validación visual por campo
  const [showError, setShowError] = useState(false);

  const inputClass = (invalid) =>
    `w-full px-3 py-2 rounded text-sm border text-gray-900 ${invalid ? 'border-red-500' : 'border-gray-300'}`;


  return (
    <div className="fixed inset-0 bg-black/50 z-[500] flex justify-end" onClick={handleClose}>
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      <a
        href={restaurant.whatsapp.slice(0, 26)}
        target="_blank"
        rel="noopener noreferrer"
        title="Abrir Soporte por Chat"
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 text-lg font-bold bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full shadow-2xl border-2 border-white hover:scale-105 transition-transform duration-200"
      >
        💬 Asesoría
      </a>

      <div
        className={`
          w-4/5 sm:w-3/5 md:w-1/4 max-w-none h-full bg-white text-black p-6 relative shadow-lg flex flex-col
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
          className="absolute top-4 right-4 text-gray-500 hover:text-black hover:scale-105 hover:cursor-pointer"
          title="Cerrar carrito"
        >
          <X className="w-5 h-5 hover:w-[1.30rem] hover:h-[1.30rem]" />
        </button>

        {/* Tu carrito */}
        <div className={`${firstActiveOrders ? "order-2" : "order-1"}`}>
          <h3 className="text-xl font-bold text-gray-800 my-3">Tu carrito</h3>
          <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-1">
            {cart.length === 0 ? (
              <p className="text-gray-500 font-thin text-md">Tu carrito está vacío.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-start gap-3 border-b pb-4 pr-2">
                  {/* Imagen a la izquierda */}
                  <img
                    src={item.image || "/assets/defaultImage.jpg"}
                    alt={item.name}
                    title={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded shadow-lg flex-shrink-0"
                  />

                  {/* Contenido */}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    {/* Nombre y Descripción */}
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-sm line-clamp-1">{item.name}</h3>
                      <button
                        onClick={() => {
                          removeFromCart(item.id);
                          audioService.play("autoInteract");
                        }}
                        className="text-red-500 hover:text-red-600 hover:scale-105"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 overflow-y-auto noscrollbar-x">{item.desc}</p>


                    {/* Controles e información */}
                    <div className="flex justify-between items-center mt-1 flex-wrap gap-2">
                      <div className="flex items-center gap-2">




                        {/* Input numérico central */}
                        <div className="flex border rounded overflow-hidden w-14">
                          <button
                            onClick={() => {
                              const current = Number(inputQuantities[item.id] ?? item.quantity);
                              const newQty = current - 1;
                              if (newQty <= 0) {
                                removeFromCart(item.id);
                                audioService.play("autoInteract");
                              } else {
                                setInputQuantities((prev) => ({ ...prev, [item.id]: String(newQty) }));
                                updateQuantity(item.id, newQty);
                                audioService.play("manualInteract");
                              }
                            }}
                            className=" w-3.5 text-sm text-gray-700 hover:text-black md:hidden"
                          >
                            –
                          </button>

                          <input
                            type="number"
                            min="1"
                            inputMode="numeric"
                            pattern="[0-9]*"
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
                            className="w-5 md:w-full text-center text-sm border-0 focus:outline-none"
                          />

                          <button
                            onClick={() => {
                              const current = Number(inputQuantities[item.id] ?? item.quantity);
                              const newQty = current + 1;
                              setInputQuantities((prev) => ({ ...prev, [item.id]: String(newQty) }));
                              updateQuantity(item.id, newQty);
                              audioService.play("manualInteract");
                            }}
                            className="w-3.5 text-sm text-gray-700 hover:text-black md:hidden"
                          >
                            +
                          </button>
                        </div>


                      </div>

                      {/* Precio */}
                      <div className="text-right text-md font-bold whitespace-nowrap ml-auto">
                        ${(item.price * item.quantity).toLocaleString("es-CL")}
                      </div>
                    </div>
                  </div>
                </div>

              ))
            )}
          </div>


          {cart.length > 0 && (
            <div className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className={inputClass(showError && !buyerName)}
                autoComplete="name"
              />

              <input
                type="tel"
                placeholder="Número de teléfono"
                value={phoneNumber}
                onChange={(e) => {
                  let raw = e.target.value.replace(/\s/g, '');
                  if (/^\+\d{2}/.test(raw)) {
                    raw = raw.slice(3);
                  }
                  const formatted = raw.replace(/[^\d]/g, '');

                  console.log("Valor recibido:", formatted);
                  setPhoneNumber(formatted);
                }}

                className={inputClass(showError && !phoneNumber)}
                inputMode="numeric"
                autoComplete="tel"
              />
              <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className={inputClass(showError && !orderType)}>
                <option value="">Tipo de orden</option>
                {Object.entries(orderOptions).map(([key, val]) => <option key={key} value={key}>{key}: {val}</option>)}
              </select>

              {orderType === "Domicilio" && (
                <>
                  <input
                    type="text"
                    placeholder="Dirección (no olvides el barrio)"
                    value={address} onChange={(e) => setAddress(e.target.value.replace(/\s+/g, ' ').trimStart())}
                    className={inputClass(showError && !address)}
                    autoComplete="street-address"
                  />
                  <AutocompleteSelect
                    placeholder="Barrio"
                    options={neighborhoodOptions}
                    value={neighborhood}
                    onChange={(option) => setNeighborhood(option.value)}
                  />
                </>
              )}

              {orderType === "Recoger" && (
                <select
                  value={selectedSede}
                  onChange={(e) => setSelectedSede(e.target.value)}
                  className={inputClass(showError && !selectedSede)}
                >
                  <option value="">Selecciona una sede</option>
                  {sedes.map((sede) => (
                    <option key={sede.id} value={`${sede.name} - ${sede.address} - ${sede.telefono}`}>
                      {sede.name} - {sede.address}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={inputClass(showError && !paymentMethod)}
              >
                <option value="">Método de pago</option>
                {Object.entries(paymentOptions).map(([key, val]) => <option key={key} value={key}>{key}: {val}</option>)}
              </select>

              <textarea
                placeholder="¿Algo más? Salsa preferida, sabor de bebida o petición especial (opcional)"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-sm resize-none h-24"
              />

              <div className="flex justify-between text-lg"><span>Subtotal</span><span>${subtotal.toLocaleString("es-CL")}</span></div>
              <div className="flex justify-between text-sm"><span>IVA</span><span>$0</span></div>
              <div className="flex justify-between text-sm"><span>Domicilio</span><span>${deliveryFee.toLocaleString("es-CL")}</span></div>
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>${total.toLocaleString("es-CL")}</span></div>

              <button
                className={`w-full font-bold py-2 rounded-lg transition ${isDisabled
                  ? 'bg-amber-200 text-gray-700 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-black hover:scale-105'
                  }`}
                onClick={handleCheckout}
              >
                Pagar
              </button>
              <button className="w-full text-sm text-gray-500 underline cursor-pointer" title="borra todos los elementos del carrito" onClick={() => { clearCart(); audioService.play("autoInteract") }}>vaciar carrito</button>
            </div>
          )}
        </div>

        {/* Seguimiento */}
        <div className={`${firstActiveOrders ? "order-1" : "order-2"}`}>
          <>
            <h3 className={`text-xl font-bold text-gray-800 ${firstActiveOrders ? "my-5" : "mt-20 my-3"}`}>Órdenes en seguimiento</h3>
            <div className="mb-6"><MyOrders /></div>
            {activeOrders.length > 0 && (<button className="w-full text-sm text-gray-500 underline cursor-pointer" onClick={() => { clearActiveOrders(); audioService.play("autoInteract"); }}>Quitar todas las órdenes en seguimiento</button>)}
          </>
        </div>

        <div className={`order-3 mt-10 pt-6 mb-10 pb-10 border-t-1 border-gray-500 `}>
          <span className="text-sm text-gray-600 mb-1 block">¿Tienes el número de una orden?</span>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Rastrea tu orden</h4>

          <input
            type="text"
            inputMode="numeric"
            placeholder="Ej: 20250001"
            value={manualOrderId}
            onChange={(e) => {
              const clean = e.target.value.replace(/\D/g, "");
              setManualOrderId(clean);
            }}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
          />

          <button
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded-lg text-sm cursor-pointer disabled:bg-amber-200 disabled:text-gray-700 disabled:cursor-not-allowed"
            onClick={handleManualOrderAdd}
            disabled={!manualOrderId.trim()}
          >
            Seguir esta orden
          </button>
        </div>


      </div>

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999]">
          <div
            className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center w-full justify-center text-yellow-500 mb-4">
              <AlertCircle className=" w-6 h-6 mr-2" />
              <h3 className="text-lg font-bold text-center">Transferencia pendiente </h3>
            </div>

            <p className="text-sm text-gray-700 mb-4 text-center">
              Tu pedido ha sido recibido, pero <span className="font-semibold">no se preparará</span> hasta que completes la transferencia bancaria por un valor de <span className="font-semibold">${total.toLocaleString("es-CL")}</span>.
            </p>

            <div className="bg-gray-100 p-4 rounded-lg text-left text-sm text-gray-800 h-40 mb-4 overflow-y-auto">
              <p className="mb-2 font-semibold flex items-center">
                <Banknote className="w-4 h-4 mr-2 text-green-600 " />
                Métodos de pago disponibles:
              </p>

              {restaurant.transferencias.map((cuenta, index) => (
                <div key={index} className="mb-3 border-b pb-2">
                  <p className="font-medium">{cuenta.name}</p>
                  <p className="text-xs text-gray-600">Cuenta/Número: <span className="font-semibold">{cuenta.value}</span></p>
                  {cuenta.titular && (
                    <p className="text-xs text-gray-600">Titular: <span className="font-semibold">{cuenta.titular}</span></p>
                  )}
                  {cuenta.cedula && (
                    <p className="text-xs text-gray-600">Cédula: <span className="font-semibold">{cuenta.cedula}</span></p>
                  )}
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-700 mb-4 text-center">
              Confirma tu transferencia y envíanos el comprobante al Whatsapp para ponernos manos a la obra.
            </div>

            <div className="flex flex-col space-y-2">
              <button
                className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-black py-2 rounded font-medium"
                onClick={() => { setShowTransferModal(false); setConfirmedTransfer(false); audioService.play("autoInteract");}}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cambiar tipo de orden
              </button>

              {!confirmedTransfer ? (
                <button
                  className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded font-medium"
                  onClick={() => { setConfirmedTransfer(true); audioService.play("manualInteract");} }
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Transferencia
                </button>
              ) : (
                <button
                  className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-2 rounded font-medium"
                  onClick={async (e) => {
                    e.stopPropagation();
                    setShowTransferModal(false);
                    const newOrder = await handleFinalTransferCheckout();
                    if (newOrder) {
                      const whatsapp = restaurant.whatsapp.slice(0, 26).replace("https://wa.me/", "");
                      const msg = `Hola, quiero pagar mi pedido ${newOrder.id} por un valor de $${(newOrder.total).toLocaleString("es-CL")} por transferencia.`;
                      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
                    }
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar comprobante por WhatsApp
                </button>
              )}

            </div>
          </div>
        </div>
      )}


    </div>
  );
}