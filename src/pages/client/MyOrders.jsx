import { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { CheckCircle, Loader2, DollarSign, Clock10Icon, AlertCircleIcon } from "lucide-react";

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
      case "por pagar":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: <DollarSign className="w-4 h-4 mr-1" />,
        };
      case "pendiente":
        return {
          color: "bg-red-100 text-red-800",
          icon: <Clock10Icon className="w-4 h-4 mr-1" />,
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
      default:
        return {
          color: "bg-gray-200 text-gray-700",
          icon: <AlertCircleIcon className="w-4 h-4 mr-1" />,
        };
    }
  };

const statusMessages = {
  "por pagar": {
    Domicilio: {
      Transferencia: [
        "Esperando tu transferencia 💸",
        "Tu orden ya está lista para pagar 📲",
      ],
    },
    Recoger: {
      Transferencia: [
        "Confirmá el pago y te preparamos todo 👌",
        "Esperando tu transferencia 💸",
      ],
    },
  },

  "pendiente": {
    Domicilio: {
      Efectivo: [
        "¡Recibido! Alistando todo 🍔",
        "Tu orden está en la cola 🕒",
      ],
      Transferencia: [
        "¡Gracias! Pago recibido. Te preparamos todo 😋",
        "Transferencia ok ✔️. En cola.",
      ],
    },
    Recoger: {
      Efectivo: [
        "¡Genial! Te lo vamos dejando listo 🛍️",
        "Alistando empaques y sabores...",
      ],
      Transferencia: [
        "Pago aprobado ✅",
        "Ya lo confirmamos, preparando tu orden 👨‍🍳",
      ],
    },
  },

  "en preparación": {
    Domicilio: {
      Efectivo: [
        "¡Manos a la obra! Cocinando tu pedido 👩‍🍳",
        "Ya casi sale para tu casa 🚚",
      ],
      Transferencia: [
        "Transferencia ok ✔️. Cocinando con amor 🍽️",
        "Pedido confirmado, ya está en cocina 🔥",
      ],
    },
    Recoger: {
      Efectivo: [
        "Preparando para que pases a buscarlo 🛍️",
        "Casi listo, te avisamos cuando esté 👀",
      ],
      Transferencia: [
        "Cocinando lo tuyo 🍔",
        "¡Ya lo estamos armando! ✨",
      ],
    },
  },

  "lista": {
    Domicilio: {
      Efectivo: [
        "¡Salió tu pedido! Llega pronto 🛵",
        "Ya va en camino 🍽️",
      ],
      Transferencia: [
        "Gracias por tu pago 🙌. En camino.",
        "Pedido enviado ✅ ¡Disfrutalo!",
      ],
    },
    Recoger: {
      Efectivo: [
        "Tu pedido está listo 🎉 ¡Pasá a buscarlo!",
        "Ya te está esperando en el local 🏠",
      ],
      Transferencia: [
        "¡Todo listo! 💯",
        "Pasá cuando quieras 😉",
      ],
    },
  },

  default: [
    "Procesando tu orden 🕒",
    "Esperando novedades del restaurante...",
  ]
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