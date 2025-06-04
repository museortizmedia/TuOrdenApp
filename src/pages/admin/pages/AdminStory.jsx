import { useEffect, useState } from 'react';
import { useRestaurant } from '../../../contexts/RestaurantContext.jsx';
import firestoreService from '../../../servicies/firestoreService.js';


export default function AdminStory() {
  const { restaurant } = useRestaurant();
  const [groupedOrders, setGroupedOrders] = useState({});

  useEffect(() => {
    if (!restaurant?.id) return;

    const year = new Date().getFullYear();
    const unsubscribe = firestoreService.listenSubcollection(
      'restaurants',
      restaurant.id,
      `historial/${year}/ordenes`,
      (orders) => {
        const parsed = orders.map(order => ({
          ...order,
          createdAt: order.createdAt?.toDate?.() || new Date(0),
        }));

        const grouped = {};
        for (const order of parsed) {
          const dateKey = order.createdAt.toISOString().split('T')[0];
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(order);
        }

        const sortedKeys = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
        const sortedGrouped = {};
        for (const key of sortedKeys) {
          sortedGrouped[key] = grouped[key].sort((a, b) => b.createdAt - a.createdAt);
        }

        setGroupedOrders(sortedGrouped);
      }
    );

    return () => unsubscribe?.(); // Cleanup on unmount
  }, [restaurant?.id]);

  return (
    <div className="p-4 text-white space-y-8">
      <h1 className="text-2xl font-bold mb-6">Historial de Órdenes</h1>
      {Object.entries(groupedOrders).map(([date, orders]) => (
        <div key={date} className="bg-[#111] p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{date}</h2>
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-[#151515] p-5 mb-3 rounded shadow border-2 border-[#202020]"
            >
              <p className={`mb-2 px-2 py-1 rounded text-xs font-semibold text-white ${
                order.status === 'pendiente' ? 'bg-red-600' :
                order.status === 'en preparación' ? 'bg-orange-500' :
                order.status === 'lista' ? 'bg-green-600' : 'bg-gray-500'
              }`}>
                {order.status || ""}
              </p>

              <p className="font-bold">Orden #{order.id}</p>
              <p className="text-sm text-gray-400">Comprador: {order.buyerName}</p>
              <ul className="mt-2 text-sm text-gray-300 list-disc list-inside">
                {order.items?.length > 0 ? (
                  order.items.map((item, index) => (
                    <li key={index}>
                      {item.name || 'Ítem'} x {item.quantity || 1}
                    </li>
                  ))
                ) : (
                  <li>Sin productos registrados</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}