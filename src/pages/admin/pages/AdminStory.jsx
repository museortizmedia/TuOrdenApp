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

    return () => unsubscribe?.();
  }, [restaurant?.id]);

  return (
    <div className="p-6 text-white space-y-8 max-w-screen-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Historial de Órdenes</h1>

      {Object.entries(groupedOrders).map(([date, orders]) => (
        <div key={date}>
          <h2 className="text-2xl font-semibold sticky top-0 bg-[#0f0f0f] py-2 px-4 z-10 mb-4 border-b border-gray-700">
            {new Date(date).toLocaleDateString("es-CL", { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-[#1a1a1a] rounded-lg shadow-md border border-[#2c2c2c] p-5 flex flex-col justify-between hover:border-yellow-400 transition-all duration-200"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white
                    ${order.status === 'pendiente' ? 'bg-red-600' :
                      order.status === 'en preparación' ? 'bg-orange-500' :
                        order.status === 'lista' ? 'bg-green-600' :
                          'bg-gray-600'
                    }`}>
                    {order.status || ""}
                  </span>
                  <span className="text-sm text-gray-400">#{order.id}</span>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-lg text-yellow-300">{order.buyerName}</p>
                  {order.phoneNumber && (
                    <a
                      href={`https://wa.me/57${order.phoneNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-400 hover:underline"
                    >
                      {order.phoneNumber}
                    </a>
                  )}
                  <p className="text-sm text-gray-400">{order.address}</p>
                </div>

                <ul className="mt-4 space-y-1 text-sm text-gray-300">
                  {order.items?.length > 0 ? (
                    order.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.name || 'Ítem'} x {item.quantity || 1}</span>
                        <span className="text-yellow-200">${(item.price || 0).toLocaleString("es-CL")}</span>
                      </li>
                    ))
                  ) : (
                    <li className="italic text-gray-500">Sin productos registrados</li>
                  )}
                </ul>

                <div className="mt-4 pt-2 border-t border-gray-700 text-sm font-semibold text-yellow-400 flex justify-between">
                  <span>Total:</span>
                  <span>${order.total?.toLocaleString("es-CL") || '0'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
