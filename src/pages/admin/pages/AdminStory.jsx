import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../../../firebase/firebase.js";
import { useRestaurant } from '../../../contexts/RestaurantContext.jsx';

export default function AdminStory() {
    const { restaurant } = useRestaurant();
    const [groupedOrders, setGroupedOrders] = useState({});

    useEffect(() => {
        if (!restaurant?.id) return;

        const fetchHistorial = async () => {
            const year = new Date().getFullYear();
            const historialRef = collection(
                db,
                `restaurants/${restaurant.id}/historial/${year}/ordenes`
            );

            const snapshot = await getDocs(historialRef);
            const orders = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || new Date(0),
                };
            });

            // Agrupar por fecha (yyyy-mm-dd)
            const grouped = {};
            for (const order of orders) {
                const dateKey = order.createdAt.toISOString().split('T')[0];
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(order);
            }

            // Ordenar fechas descendente
            const sortedKeys = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
            const sortedGrouped = {};
            for (const key of sortedKeys) {
                // Dentro de cada día, ordenar también por hora descendente
                sortedGrouped[key] = grouped[key].sort((a, b) => b.createdAt - a.createdAt);
            }

            setGroupedOrders(sortedGrouped);
        };

        fetchHistorial();
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
                            className="border border-gray-700 p-3 mb-3 rounded bg-[#1a1a1a]"
                        >
                            <p className="font-bold">Orden #{order.id}</p>
                            <p className="text-sm text-gray-400">Comprador: {order.buyerName}</p>
                            <ul className="mt-2 text-sm text-gray-300 list-disc list-inside">
                                {order.items && order.items.length > 0 ? (
                                    order.items.map((item, index) => (
                                        <li key={index}>
                                            {item.name || 'Ítem'} x {item.quantity || 1}
                                        </li>
                                    ))
                                ) : (
                                    <li>Sin productos registrados</li>
                                )}
                            </ul>
                            <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm opacity-50 cursor-not-allowed">
                                Acción futura
                            </button>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}