import { useEffect, useState } from 'react';
import { useRestaurant } from '../../../contexts/RestaurantContext.jsx';
import firestoreService from '../../../servicies/firestoreService.js';
import { ChevronDown, MoreVertical, RotateCcw, Trash2Icon, TrashIcon, Undo, Undo2Icon } from 'lucide-react';
import MenuOpciones from '../../../components/MenuOpciones.jsx';
import toast from 'react-hot-toast';

export default function AdminStory() {
  const { restaurant } = useRestaurant();
  const [groupedOrders, setGroupedOrders] = useState({});

  const [allOrders, setAllOrders] = useState([]);
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

        setAllOrders(parsed);

        const grouped = {};
        for (const order of parsed) {
          const dateKey = order.createdAt.toLocaleDateString('sv-SE', {
            timeZone: 'America/Bogota',
          }); // → 'YYYY-MM-DD'

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

  const [sampleDates, setSampleDates] = useState({});
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

        setAllOrders(parsed); // Guarda todas las órdenes sin filtrar

        // ✅ Agrupar por fecha local (Bogotá)
        const grouped = {};
        const sampleDateForGroup = {}; // ← para encabezado visual correcto

        for (const order of parsed) {
          const dateKey = order.createdAt.toLocaleDateString('sv-SE', {
            timeZone: 'America/Bogota',
          });

          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
            sampleDateForGroup[dateKey] = order.createdAt; // guarda muestra real
          }

          grouped[dateKey].push(order);
        }

        // ✅ Ordenar por fecha descendente
        const sortedKeys = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
        const sortedGrouped = {};
        for (const key of sortedKeys) {
          sortedGrouped[key] = grouped[key].sort((a, b) => b.createdAt - a.createdAt);
        }

        setGroupedOrders(sortedGrouped);
        setSampleDates(sampleDateForGroup); // ← nuevo estado para mostrar días bien
        setCollapsedDates(Object.fromEntries(sortedKeys.map(key => [key, true])));

        // 📊 Estadísticas
        calcularEstadisticas(parsed);
      }
    );

    return () => unsubscribe?.();
  }, [restaurant?.id]);

  const calcularEstadisticas = (orders) => {
    const ordenesValidas = orders.filter(o => !o.softdelete);

    const totalOrdenes = ordenesValidas.length;
    const totalVentas = ordenesValidas.reduce((sum, o) => sum + (o.total || 0), 0);
    const ticketPromedio = totalOrdenes ? Math.round(totalVentas / totalOrdenes) : 0;

    const porMetodoPago = {};
    const porTipoOrden = { Domicilio: 0, Recoger: 0 };
    let totalDeliveryFee = 0;
    let taxTotal = 0;

    const productoCount = {};
    const clienteGasto = {};
    const clienteNombres = {};
    const clienteOrdenesCount = {};

    for (const o of ordenesValidas) {
      porMetodoPago[o.paymentMethod] = (porMetodoPago[o.paymentMethod] || 0) + (o.total || 0);
      porTipoOrden[o.orderType] = (porTipoOrden[o.orderType] || 0) + 1;

      if (o.orderType === "Domicilio") {
        totalDeliveryFee += o.deliveryFee || 0;
      }

      taxTotal += o.tax || 0;

      for (const item of o.items || []) {
        productoCount[item.name] = (productoCount[item.name] || 0) + item.quantity;

        const clienteKey = o.phoneNumber || "Desconocido";
        const gasto = (item.price || 0) * item.quantity;
        clienteGasto[clienteKey] = (clienteGasto[clienteKey] || 0) + gasto;

        if (!clienteNombres[clienteKey]) {
          clienteNombres[clienteKey] = o.buyerName;
        }
      }

      const clienteKey = o.phoneNumber || "Desconocido";
      clienteOrdenesCount[clienteKey] = (clienteOrdenesCount[clienteKey] || 0) + 1;
    }

    const topProductos = Object.entries(productoCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const [topClienteTel, topClienteGasto] = Object.entries(clienteGasto)
      .sort((a, b) => b[1] - a[1])[0] || ["", 0];

    const topClienteName = clienteNombres[topClienteTel] || "";
    const topClienteCount = clienteOrdenesCount[topClienteTel] || 0;

    setStats({
      totalVentas,
      totalOrdenes,
      ticketPromedio,
      porMetodoPago,
      porTipoOrden,
      ticketPromedioDomicilio: totalDeliveryFee,
      taxTotal,
      topProductos,
      clienteEstrella: {
        telefono: topClienteTel,
        nombre: topClienteName,
        gastoTotal: topClienteGasto,
        cantidad: topClienteCount
      }
    });
  };

  //Filtros
  const [filters, setFilters] = useState({
    fechaDesde: null,
    fechaHasta: null,
    diasSemana: [],      // ej: ['lunes', 'martes']
    sedes: [],            // ej: ['Sede Norte', 'Sede Sur']
  });

  const diasSemana = [
    { valor: "lunes", etiqueta: "Lunes" },
    { valor: "martes", etiqueta: "Martes" },
    { valor: "miercoles", etiqueta: "Miércoles" },
    { valor: "jueves", etiqueta: "Jueves" },
    { valor: "viernes", etiqueta: "Viernes" },
    { valor: "sabado", etiqueta: "Sábado" },
    { valor: "domingo", etiqueta: "Domingo" },
  ];

  useEffect(() => {
    if (!allOrders.length) return;

    const filtradas = allOrders.filter((order) => {
      const fecha = order.createdAt;

      const diaSemana = order.createdAt
        .toLocaleDateString('es-CL', {
          weekday: 'long',
          timeZone: 'America/Bogota',
        })
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      const cumpleFecha =
        (!filters.fechaDesde || fecha >= filters.fechaDesde) &&
        (!filters.fechaHasta || fecha <= filters.fechaHasta);

      const cumpleDia =
        filters.diasSemana.length === 0 || filters.diasSemana.includes(diaSemana);

      const cumpleSede =
        filters.sedes.length === 0 || filters.sedes.includes(order.sede); // ← debes tener campo sede

      return cumpleFecha && cumpleDia && cumpleSede;
    });

    // Agrupar y actualizar estado como antes
    const grouped = {};
    for (const order of filtradas) {
      const dateKey = order.createdAt.toLocaleDateString('sv-SE', {
        timeZone: 'America/Bogota',
      });

      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(order);
    }

    const sortedKeys = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
    const sortedGrouped = {};
    for (const key of sortedKeys) {
      sortedGrouped[key] = grouped[key].sort((a, b) => b.createdAt - a.createdAt);
    }

    setGroupedOrders(sortedGrouped);
    setCollapsedDates(Object.fromEntries(sortedKeys.map(key => [key, true])));

    // Calcula estadísticas también con las filtradas
    calcularEstadisticas(filtradas);

  }, [filters, allOrders]);

  // Eliminar orden
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inputClave, setInputClave] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const openModal = (order) => {
    setSelectedOrder(order);
    setInputClave("");
    setShowPasswordModal(true);
  };

  const closeModal = () => {
    setShowPasswordModal(false);
    setSelectedOrder(null);
    setInputClave("");
  };

  const confirmarAccion = async () => {
    if (!selectedOrder) return;

    const esRestauracion = selectedOrder.softdelete === true;
    const claveCorrecta = inputClave?.toString() === restaurant.deletePSW?.toString();

    if (!claveCorrecta) {
      toast.error("Contraseña incorrecta");
      closeModal();
      return;
    }

    const newState = !esRestauracion;
    const añoActual = new Date().getFullYear();

    try {
      await firestoreService.update(
        `restaurants/${restaurant.id}/historial/${añoActual}/ordenes`,
        selectedOrder.id,
        { softdelete: newState }
      );

      toast.success(`Orden ${newState ? "eliminada" : "restaurada"}`);
    } catch (error) {
      console.error("Error al actualizar softdelete:", error);
      toast.error("No se pudo actualizar la orden");
    } finally {
      closeModal();
    }
  };

  return (
    <div className="p-6 text-white space-y-8 max-w-screen-2xl mx-auto">

      {/* Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={closeModal}>
          <div className="bg-[#111] text-white rounded-xl p-6 shadow-lg w-[90%] max-w-sm" onClick={(e) => { e.stopPropagation(); }}>
            <h2 className="text-lg font-semibold mb-4">
              Clave de {selectedOrder?.softdelete === true ? "restauración" : "eliminación"}
            </h2>

            <input
              type="password"
              placeholder="Contraseña"
              value={inputClave}
              onChange={(e) => setInputClave(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
              autoComplete='off'
            />

            <div className="flex justify-between gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-300 text-gray-950 hover:scale-105 cursor-pointer font-semibold rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTROS */}
      <div className="bg-[#1a1a1a] p-4 rounded-xl mb-6 grid gap-4 text-white"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div>
          <div>
            <label className="block text-sm text-gray-400">Desde</label>
            <input type="date" className="bg-[#0f0f0f] p-2 rounded-lg w-full" onChange={(e) =>
              setFilters(prev => ({ ...prev, fechaDesde: e.target.value ? new Date(e.target.value) : null }))
            } />
          </div>
          <div>
            <label className="block text-sm text-gray-400">{"Hasta (excluyente)"}</label>
            <input type="date" className="bg-[#0f0f0f] p-2 rounded-lg w-full" onChange={(e) =>
              setFilters(prev => ({ ...prev, fechaHasta: e.target.value ? new Date(e.target.value) : null }))
            } />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400">Días</label>
          <select
            multiple
            className="bg-[#0f0f0f] p-2 rounded-s-lg w-full"
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(o => o.value);

              // Si seleccionan "todos", se limpian los filtros de día
              if (selected.includes("todos")) {
                setFilters(prev => ({ ...prev, diasSemana: [] }));
              } else {
                setFilters(prev => ({ ...prev, diasSemana: selected }));
              }
            }}
          >
            <option value="todos">Todos</option>
            {diasSemana.map(dia => (
              <option key={dia.valor} value={dia.valor}>{dia.etiqueta}</option>
            ))}
          </select>
        </div>

        {/*<div>
          <label className="block text-sm text-gray-400">Sedes</label>
          <select multiple className="bg-[#0f0f0f] p-2 rounded w-full" onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map(o => o.value);
            setFilters(prev => ({ ...prev, sedes: selected }));
          }}>
            //Aquí puedes mapear dinámicamente si tienes una lista de sedes
            <option value="Sede Norte">Sede Norte</option>
            <option value="Sede Sur">Sede Sur</option>
          </select>
        </div>*/}
      </div>


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

        {/* 🎟️ Venta */}
        <div className="bg-[#1f1f1f] p-5 rounded-xl shadow border border-yellow-500">
          <p className="text-sm text-gray-400 mb-1">Valor Promedio</p>
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
              </a> ({stats.clienteEstrella.cantidad == "1" ? stats.clienteEstrella.cantidad + " pedido" : stats.clienteEstrella.cantidad + " pedidos"}{": $" + stats.clienteEstrella.gastoTotal.toLocaleString("es-CL")})
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
            {sampleDates[date]?.toLocaleDateString("es-CL", {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              timeZone: 'America/Bogota',
            })}

          </h2>

          {!collapsedDates[date] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 p-5">
              {orders.map(order => (

                <>
                  {/* CARTA NORMAL */}
                  <div
                    key={order.id}
                    className={`${!!order.softdelete === true ? "bg-[#111111] opacity-50" : "bg-[#1a1a1a] hover:border-yellow-400"} rounded-lg shadow-md border border-[#2c2c2c] p-5 flex flex-col justify-between transition-all duration-200`}
                  >
                    <div className="flex justify-between items-center mb-3">

                      <span className="text-sm text-gray-400">#{order.id}</span>

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white
                              ${order.status === 'pendiente' ? 'bg-red-600' :
                          order.status === 'en preparación' ? 'bg-orange-500' :
                            order.status === 'lista' ? 'bg-green-600' :
                              'bg-gray-600'
                        }`}>
                        {order.status || ""}
                      </span>

                      <MenuOpciones
                        opciones={
                          [{ label: !!order.softdelete === true ? "Restaurar" : "Eliminar", onClick: () => openModal(order) },]}
                      />

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
                            <span>{item.name || 'Ítem'} x {item.quantity || 1} {item.selectedVariation != null && (<>: <span className="italic text-gray-500">{item.selectedVariation}</span></>)}</span>
                            <span className="text-yellow-200">${(item.price || 0).toLocaleString("es-CL")}</span>
                          </li>
                        ))
                      ) : (
                        <li className="italic text-gray-500">Sin productos registrados</li>
                      )}
                    </ul>


                    {order.deliveryFee && <div className="mt-4 text-sm font-semibold text-yellow-100 flex justify-between">
                      <span>Domicilio:</span>
                      <span>${order.deliveryFee?.toLocaleString("es-CL") || '0'}</span>
                    </div>
                    }

                    <div className="mt-4 pt-2 border-t border-gray-700 text-sm font-semibold text-yellow-400 flex justify-between">
                      <span>Total:</span>
                      <span>${order.total?.toLocaleString("es-CL") || '0'}</span>
                    </div>
                  </div>

                </>
              ))}
            </div>
          )}

        </div>
      ))}
    </div>
  );
}
