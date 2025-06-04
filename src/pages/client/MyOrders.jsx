import { useCart } from "../../contexts/CartContext";

export default function MyOrders() {
  const { activeOrders } = useCart();

  if (!activeOrders.length)
    return (
      <div className="w-full p-4 bg-white/80 text-gray-600 rounded-md shadow">
        No tienes órdenes activas.
      </div>
    );

  return (
    <div className="w-full max-h-64 overflow-y-auto p-4 bg-white/80 rounded-md shadow space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Órdenes Activas</h3>

      {activeOrders.map((order) => (
        <div
          key={order.id}
          className="border border-gray-300 rounded-lg p-3 bg-white shadow-sm"
        >
          <div className="text-sm text-gray-700 mb-1">
            <span className="font-semibold">Orden:</span>{" "}
            <span className="font-mono">{order.id}</span>
          </div>
          <div className="text-sm text-gray-700 mb-1">
            <span className="font-semibold">Nombre:</span> {order.buyerName}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Estado:</span>{" "}
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-semibold text-white ${
                order.status === "pendiente"
                  ? "bg-red-500"
                  : order.status === "en preparación"
                  ? "bg-orange-500"
                  : order.status === "lista"
                  ? "bg-green-600"
                  : "bg-gray-500"
              }`}
            >
              {order.status || ""}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}