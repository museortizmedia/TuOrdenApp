import { useEffect, useState } from 'react';
import { useRestaurant } from '../../../contexts/RestaurantContext.jsx';
import firestoreService from '../../../servicies/firestoreService.js';
import { ChevronDown } from 'lucide-react';

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

        // Inicializar fechas colapsadas
        const collapsedInit = {};
        for (const key of sortedKeys) {
          collapsedInit[key] = true;
        }
        setCollapsedDates(collapsedInit);

      }
    );

    return () => unsubscribe?.();
  }, [restaurant?.id]);

  // Estado local por fecha
  const [collapsedDates, setCollapsedDates] = useState({});

  const toggleCollapse = (date) => {
    setCollapsedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const [stats, setStats] = useState({
    totalVentas: 0,
    totalOrdenes: 0,
    ticketPromedio: 0,
    porMetodoPago: {},
    porTipoOrden: {},
    ticketPromedioDomicilio: 0,
    taxTotal: 0,
    topProductos: [],
    clienteEstrella: { telefono: '', cantidad: 0, nombre: '' }
  });

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

        // Agrupar por fecha
        const grouped = {};
        for (const order of parsed) {
          const dateKey = order.createdAt.toISOString().split('T')[0];
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(order);
        }

        // Ordenar por fecha
        const sortedKeys = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
        const sortedGrouped = {};
        for (const key of sortedKeys) {
          sortedGrouped[key] = grouped[key].sort((a, b) => b.createdAt - a.createdAt);
        }

        setGroupedOrders(sortedGrouped);

        // 📊 Estadísticas
        const totalOrdenes = parsed.length;
        const totalVentas = parsed.reduce((sum, o) => sum + (o.total || 0), 0);
        const ticketPromedio = totalOrdenes ? Math.round(totalVentas / totalOrdenes) : 0;

        const porMetodoPago = {};
        const porTipoOrden = { Domicilio: 0, Recoger: 0 };
        let totalDomicilio = 0;
        let countDomicilio = 0;
        let taxTotal = 0;

        const productoCount = {};
        const clienteCount = {};
        const clienteNombres = {};

        for (const o of parsed) {
          // Métodos de pago
          porMetodoPago[o.paymentMethod] = (porMetodoPago[o.paymentMethod] || 0) + (o.total || 0);

          // Tipo de orden
          porTipoOrden[o.orderType] = (porTipoOrden[o.orderType] || 0) + 1;

          // Ticket promedio domicilio
          if (o.orderType === "Domicilio") {
            totalDomicilio += o.total || 0;
            countDomicilio += 1;
          }

          // Total impuestos
          taxTotal += o.tax || 0;

          // Productos más pedidos
          for (const item of o.items || []) {
            productoCount[item.name] = (productoCount[item.name] || 0) + item.quantity;
          }

          // Cliente estrella
          if (o.phoneNumber) {
            clienteCount[o.phoneNumber] = (clienteCount[o.phoneNumber] || 0) + 1;
          }

          if (!clienteNombres[o.phoneNumber]) {
            clienteNombres[o.phoneNumber] = o.buyerName;
          }

          if (!clienteNombres[o.phoneNumber]) {
            clienteNombres[o.phoneNumber] = o.buyerName;
          }
        }


        const topProductos = Object.entries(productoCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        const [topClienteTel, topClienteCount] = Object.entries(clienteCount)
          .sort((a, b) => b[1] - a[1])[0] || ["", 0];

        const topClienteName = clienteNombres[topClienteTel] || "";

        setStats({
          totalVentas,
          totalOrdenes,
          ticketPromedio,
          porMetodoPago,
          porTipoOrden,
          ticketPromedioDomicilio: countDomicilio ? Math.round(totalDomicilio / countDomicilio) : 0,
          taxTotal,
          topProductos,
          clienteEstrella: { telefono: topClienteTel, cantidad: topClienteCount, nombre: topClienteName }
        });
      }
    );

    return () => unsubscribe?.();
  }, [restaurant?.id]);


  return (
    <div className="p-6 text-white space-y-8 max-w-screen-2xl mx-auto">

      {/* 📊 Panel de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10 text-white">

        {/* 💵 Totales */}
        <div className="bg-[#1f1f1f] p-5 rounded-xl shadow border border-yellow-500">
          <p className="text-sm text-gray-400 mb-1">Total vendido</p>
          <p className="text-2xl font-bold text-yellow-300">${stats.totalVentas.toLocaleString("es-CL")}</p>
          <div className="text-xs text-gray-400 mt-2 space-y-1">
            {Object.entries(stats.porMetodoPago).map(([metodo, monto]) => (
              <p key={metodo}>{metodo}: <span className="text-white">${monto.toLocaleString("es-CL")}</span></p>
            ))}
          </div>
        </div>

        {/* 📦 Órdenes */}
        <div className="bg-[#1f1f1f] p-5 rounded-xl shadow border border-yellow-500">
          <p className="text-sm text-gray-400 mb-1">Órdenes registradas</p>
          <p className="text-2xl font-bold text-yellow-300">{stats.totalOrdenes}</p>
          <div className="text-xs text-gray-400 mt-2 space-y-1">
            <p>Domicilio: <span className="text-white">{stats.porTipoOrden.Domicilio || 0}</span></p>
            <p>Recoger: <span className="text-white">{stats.porTipoOrden.Recoger || 0}</span></p>
          </div>
        </div>

        {/* 🎟️ Tickets */}
        <div className="bg-[#1f1f1f] p-5 rounded-xl shadow border border-yellow-500">
          <p className="text-sm text-gray-400 mb-1">Ticket promedio</p>
          <p className="text-2xl font-bold text-yellow-300">${stats.ticketPromedio.toLocaleString("es-CL")}</p>
          <div className="text-xs text-gray-400 mt-2 space-y-1">
            <p>Domicilio: <span className="text-white">${stats.ticketPromedioDomicilio.toLocaleString("es-CL")}</span></p>
            <p>IVA total: <span className="text-white">${stats.taxTotal.toLocaleString("es-CL")}</span></p>
          </div>
        </div>

        {/* 🏆 Productos y cliente */}
        <div className="bg-[#1f1f1f] p-5 rounded-xl shadow border border-yellow-500">
          <p className="text-sm text-gray-400 mb-1">Top productos</p>
          <ul className="text-xs text-white space-y-1">
            {stats.topProductos.map(([producto, cantidad], index) => (
              <li key={producto}> <span className='font-black'>{index + 1}.</span> {producto} ({cantidad})</li>
            ))}
          </ul>
          {stats.clienteEstrella.telefono && (
            <p className="mt-3 text-xs text-gray-400">
              👑 Cliente estrella:<br />
              <a href={`https://wa.me/57${stats.clienteEstrella.telefono}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                {stats.clienteEstrella.nombre}
              </a> ({stats.clienteEstrella.cantidad} pedidos)
            </p>
          )}
        </div>
      </div>


      {/* Historial */}
      <h1 className="text-3xl font-bold mb-8 text-center">Historial de Órdenes</h1>

      {Object.entries(groupedOrders).map(([date, orders]) => (
        <div key={date} className='bg-[#0f0f0f] p-1 rounded-2xl'>
          <h2 onClick={() => toggleCollapse(date)} className={`text-2xl font-semibold sticky top-0  py-2 px-4 z-10 mb-4 ${collapsedDates[date] ? '' : 'bg-[#0f0f0f] border-b border-gray-700'} `}>
            <ChevronDown className={`mr-2 inline transition-transform ${collapsedDates[date] ? 'rotate-180' : ''}`} />
            {new Date(date).toLocaleDateString("es-CL", { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>

          {!collapsedDates[date] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 p-5">
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
          )}

        </div>
      ))}
    </div>
  );
}
