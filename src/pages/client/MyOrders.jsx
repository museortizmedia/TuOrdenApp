import { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { CheckCircle, Clock, AlertCircle, Loader2, DollarSign } from "lucide-react";

export default function MyOrders() {
  const { activeOrders } = useCart();

  if (!activeOrders.length)
    return (
      <div className="w-full p-4 bg-white/80 text-gray-600 rounded-md shadow">
        No tienes órdenes activas. Pide algo de la carta primero.
      </div>
    );

  const getStatusStyle = (status) => {
    switch (status) {
      case "pendiente":
        return {
          color: "bg-red-100 text-red-800",
          icon: <AlertCircle className="w-4 h-4 mr-1" />,
        };
      case "en preparación":
        return {
          color: "bg-orange-100 text-orange-800",
          icon: <Loader2 className="w-4 h-4 mr-1 animate-spin" />,
        };
      case "lista":
        return {
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
        };
      case "por pagar":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: <DollarSign className="w-4 h-4 mr-1" />,
        };
      default:
        return {
          color: "bg-gray-200 text-gray-700",
          icon: <Clock className="w-4 h-4 mr-1" />,
        };
    }
  };

  const statusMessages = {
    "por pagar": {
      Domicilio: {
        Transferencia: [
          "Esperando transferencia...",
          "Tu orden está lista para pagar.",
        ],
      },
      Recoger: {
        Transferencia: [
          "Confirma el pago para recoger en el local.",
          "Esperando transferencia...",
        ],
      },
    },
    "pendiente": {
      Domicilio: {
        Efectivo: [
          "Estamos preparando tu orden...",
          "Tu orden está en la cola...",
        ],
        Transferencia: [
          "Transferencia aprobada. Orden en la cola.",
          "Transferencia aprobada.",
        ],
      },
      Recoger: {
        Efectivo: [
          "Calibrando tu orden para recoger...",
          "Preparando los empaques...",
        ],
        Transferencia: [
          "Transferencia aprobada.",
          "Estamos confirmando el pago.",
        ],
      },
    },
    "en preparación": {
      Domicilio: {
        Efectivo: [
          "¡Estamos cocinando! 🚚🍔",
          "Tu pedido va en camino pronto.",
        ],
        Transferencia: [
          "Transferencia recibida. Cocinando...",
          "Pedido confirmado y en preparación.",
        ],
      },
      Recoger: {
        Efectivo: [
          "Preparando para recoger.",
          "Estará listo pronto.",
        ],
        Transferencia: [
          "Transferencia recibida. Cocinando....",
          "En cocina 🧑‍🍳",
        ],
      },
    },
    "lista": {
      Domicilio: {
        Efectivo: [
          "Pedido listo y en camino 🛵",
          "Ya salió para tu casa.",
        ],
        Transferencia: [
          "Enviado. Gracias por tu pago.",
          "Pedido en camino. 🧾✅",
        ],
      },
      Recoger: {
        Efectivo: [
          "Ven a recoger tu orden.",
          "Está listo para ti.",
        ],
        Transferencia: [
          "Orden lista y pagada.",
          "Pasa por el local cuando quieras.",
        ],
      },
    },
    default: ["Procesando orden...", "Esperando actualización..."]
  };

  const [animatedMessages, setAnimatedMessages] = useState({});

  useEffect(() => {
    if (!activeOrders.length) return;

    const updateMessages = () => {
      const newMessages = {};
      activeOrders.forEach(order => {
        newMessages[order.id] = getRandomStatusMessage(order.status, order.orderType, order.paymentMethod);
      });
      setAnimatedMessages(newMessages);
    };


    updateMessages(); // inicial
    const interval = setInterval(updateMessages, 8000); // cada 8s

    return () => clearInterval(interval); // limpieza
  }, [activeOrders]);


  const getRandomStatusMessage = (status, orderType, paymentMethod) => {
    const fallback = statusMessages.default;
    const messages =
      statusMessages?.[status]?.[orderType]?.[paymentMethod] || fallback;
    return messages[Math.floor(Math.random() * messages.length)];
  };



  return (
    <>
      {activeOrders.map((order) => {
        const statusInfo = getStatusStyle(order.status);

        return (
          <div
            key={order.id}
            className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-2 mt-2"
          >
            <div className="text-sm text-gray-800">
              <span className="font-semibold">Orden:</span>{" "}
              <span className="font-mono">{order.id} | {order.orderType || ""}</span>
            </div>
            <div className="text-sm text-gray-800">
              <span className="font-semibold">Nombre:</span> {order.buyerName}
            </div>

            <div className="text-sm text-gray-800">
              <span className="font-semibold">
                {order.orderType == "Domicilio" ? order.status == "lista" ? "Salió para:" : "Se entregará en:" : order.status == "lista" ? "Se preparó en:" : "Se preparará en:"}
              </span> {order.orderType == "Domicilio" ? order.address : order.sede.split("-")[0] || ""}
            </div>
            <div className="text-sm text-gray-800 flex items-center">
              <span className="font-semibold mr-1">Estado:</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
              >
                {statusInfo.icon}
                {animatedMessages[order.id] || getRandomStatusMessage(order.status, order.orderType, order.paymentMethod)}
              </span>
            </div>

            {(order.orderType == "Recoger" && order.status == "lista") &&
              <div className='p-2'>
                <p className="text-sm text-gray-800 font-medium">Te esperamos en:</p>
                <p className="text-sm text-gray-500">{order.sede.split("-")[0] || ""}</p>
                <p className="text-sm text-gray-500">{order.sede.split("-")[1] || ""}</p>
                <p className="text-sm text-gray-500">{order.sede.split("-")[2] || ""}</p>
              </div>
            }
          </div>
        );
      })}
    </>
  );
}