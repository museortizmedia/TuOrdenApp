import { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, updateDoc, doc, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from "../../../firebase/firebase.js";
import { useRestaurant } from '../../../contexts/RestaurantContext.jsx';
import toast, { Toaster } from 'react-hot-toast';
import { AlertCircle, Archive, CheckCircle, ClockIcon, CreditCardIcon, DollarSign, FlameIcon, PrinterIcon } from 'lucide-react';
import ToggleSwitch from '../../../components/ToogleSwitch.jsx';

export default function AdminOrdenes() {
    const { restaurant } = useRestaurant();
    const [orders, setOrders] = useState([]);
    const [openDetails, setOpenDetails] = useState({});

    // Detectar ordenenes en tiempo real y notificaciones
    const [newOrderCount, setNewOrderCount] = useState(0);

    const knownOrderIds = useRef(new Set());
    const unreadOrdersRef = useRef([]); // 🟡 Lista acumulada de no leídos
    const hasUnread = useRef(false);     // 🔴 Flag de "hay no leídos"

    useEffect(() => {
        if (!restaurant?.id) return;

        const ordersRef = collection(db, `restaurants/${restaurant.id}/ordenes`);
        const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
            const incomingOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const newOrders = incomingOrders.filter(order => !knownOrderIds.current.has(order.id));

            if (newOrders.length > 0) {
                // Actualiza referencias
                newOrders.forEach(order => knownOrderIds.current.add(order.id));
                unreadOrdersRef.current.push(...newOrders);
                hasUnread.current = true;

                // Mostrar notificaciones
                const totalUnread = unreadOrdersRef.current.length;

                if (totalUnread > 1) {
                    const ids = unreadOrdersRef.current.map(order => `#${order.id}`).join(", ");
                    notify("📦 Nuevos pedidos", `${totalUnread} pedidos: ${ids}`, "pedidos-agrupados");
                } else {
                    const { id } = newOrders[0];
                    notify("🛎️ Nuevo pedido", `Orden #${id} lista para revisar`, `pedido-${id}`);
                }

                setNewOrderCount(totalUnread);
            }

            setOrders(incomingOrders);
        });

        return () => unsubscribe();
    }, [restaurant?.id]);

    // 🔁 Marca como leídos al hacer foco o clic
    useEffect(() => {
        const handleInteraction = () => {
            if (!hasUnread.current) return;

            unreadOrdersRef.current = [];
            setNewOrderCount(0);
            hasUnread.current = false;
            console.log("✅ Pedidos marcados como leídos");
        };

        window.addEventListener("focus", handleInteraction);
        window.addEventListener("click", handleInteraction);

        return () => {
            window.removeEventListener("focus", handleInteraction);
            window.removeEventListener("click", handleInteraction);
        };
    }, []);

    // Nuevas ordenes en titulo de de ventana
    const originalTitle = useRef(document.title); // Titulo de la ventanan original
    useEffect(() => {
        if (newOrderCount > 0) {
            document.title = `(${newOrderCount}) ${originalTitle.current}`;
        } else {
            document.title = originalTitle.current;
        }
    }, [newOrderCount]);

    function notify(title, body, tag = "pedido-nuevo") {
        const notificationsEnabled = localStorage.getItem("notificationsEnabled") !== "false";

        if (Notification.permission === "granted" && notificationsEnabled) {
            const n = new Notification(
                title, {
                body,
                tag,
                /*image: "/icon-1000",
                icon: "/icon-512.png",
                badge: "/icon-32.png",*/
                renotify: true,
                requireInteraction: true,
                silent: false
            });
            n.onclick = (e) => {
                e.preventDefault();
                window.focus();
            };
        }
    }


    const toggleDetails = (orderId) => {
        setOpenDetails(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        const orderRef = doc(db, `restaurants/${restaurant.id}/ordenes/${orderId}`);
        await toast.promise(
            updateDoc(orderRef, { status: newStatus }),
            {
                loading: 'Actualizando orden...',
                success: `Orden movida a "${newStatus}"`,
                error: 'Error al mover la orden',
            }
        );
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const orderId = e.dataTransfer.getData('text/plain');
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        if (order.status === newStatus || (newStatus === "pendiente" && order.status === "por pagar")) return;
        await updateOrderStatus(orderId, newStatus);
    };

    const allowDrop = (e) => e.preventDefault();

    const handleDragStart = (e, orderId) => {
        e.dataTransfer.setData('text/plain', orderId);
    };

    const togglePagoEstado = async (orderId, nuevoEstado) => {
        const orderRef = doc(db, `restaurants/${restaurant.id}/ordenes/${orderId}`);
        try {
            await updateDoc(orderRef, { status: nuevoEstado });
            toast.success(`Orden marcada como "${nuevoEstado}"`);
        } catch (error) {
            toast.error("No se pudo actualizar el estado de pago");
            console.error(error);
        }
    };

    const handlePagosTransferencias = (e, order, isPagado) => {
        e.preventDefault();
        const nuevoEstado = isPagado ? "pendiente" : "por pagar";
        togglePagoEstado(order.id, nuevoEstado);
    };

    // Imprimir
const handleImpresion = (e, order) => {
    e.preventDefault();
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const win = window.open('', '', `width=${width},height=${height},left=${left},top=${top}`);
    if (!win) return;

    const fecha = order.createdAt?.toDate?.().toLocaleString?.() || new Date().toLocaleString();
    const itemsHtml = order.items?.map(item => `
        <tr>
            <td>1x</td>
            <td>${item.name || 'Producto'}</td>
            <td style="text-align:right;">$${(item.price || 0).toLocaleString("es-CL")}</td>
        </tr>
    `).join('') || '';

    const subtotal = order.subtotal || 0;
    const tax = order.tax || 0;
    const delivery = order.deliveryFee || 0;
    const total = order.total || 0;

    const html = `
<html>
<head>
    <title>Orden #${order.id}</title>
    <style>
        @media print { 
            @page { size: 58mm auto; margin: 0; } 
            body { margin: 0; padding: 0; width: 58mm; } 
        }
        body { 
            font-family: monospace; 
            width: 58mm; 
            padding: 10px; 
            color: black; 
        }
        .center { text-align: center; font-size: 22px; font-weight: bold; }
        .section-title { font-size: 18px; font-weight: bold; margin-top: 12px; }
        .boxed { border: 2px solid black; padding: 10px; margin: 10px 0; font-size: 20px; font-weight: bold; text-align: center; }
        table { width: 100%; margin-top: 10px; } 
        td { font-size: 16px; padding: 4px 0; }
        .totales td { font-weight: bold; font-size: 16px; }
        .total-final { font-size: 20px; font-weight: bold; margin-top: 10px; text-align: right; }
        hr { border: none; border-top: 2px solid black; margin: 12px 0; }
    </style>
</head>
<body>

    <div class="center">${restaurant?.name || 'Restaurante'}</div>
    <div class="boxed">ORDEN #${order.id}</div>
    <div><strong>Fecha:</strong> ${fecha}</div>

    <div class="section-title">Pedido</div>
    <table>${itemsHtml}</table><hr />
    <table class="totales">
        <tr><td>Subtotal</td><td></td><td style="text-align:right;">$${subtotal.toLocaleString("es-CL")}</td></tr>
        <tr><td>Impuestos</td><td></td><td style="text-align:right;">$${tax.toLocaleString("es-CL")}</td></tr>
        <tr><td>Domicilio</td><td></td><td style="text-align:right;">$${delivery.toLocaleString("es-CL")}</td></tr>
    </table>
    <div class="total-final">TOTAL: $${total.toLocaleString("es-CL")}</div><hr />

    <div class="section-title">Cliente</div>
    <div><strong>Nombre:</strong> ${order.buyerName}</div>
    <div><strong>Dirección:</strong></div>
    <div>${order.address}</div>
    <div><strong>Sector:</strong> ${order.neighborhood}</div>
    <div><strong>Teléfono:</strong> ${order.phoneNumber || 'No disponible'}</div>
    <div><strong>Medio de pago:</strong>${order.paymentMethod || 'No especificado'}</div>

    <script>
        window.onload = function() { 
            window.print(); 
            setTimeout(() => window.close(), 500); 
        }
    </script>
</body>
</html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
};


    // Archivar
    const archivarOrden = async (order) => {
        const añoActual = new Date().getFullYear();
        const historialRef = doc(db, `restaurants/${restaurant.id}/historial/${añoActual}/ordenes/${order.id}`);
        const ordenRef = doc(db, `restaurants/${restaurant.id}/ordenes/${order.id}`);

        try {
            await setDoc(historialRef, order);
            await deleteDoc(ordenRef);
            toast.success("Orden archivada");
        } catch (error) {
            console.error("Error al archivar orden:", error);
            toast.error("No se pudo archivar la orden");
        }
    };

    const moverOrdenesAntiguas = async () => {
        if (!restaurant?.id) return;

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const ordenesRef = collection(db, `restaurants/${restaurant.id}/ordenes`);
        const snapshot = await getDocs(ordenesRef);

        const añoActual = new Date().getFullYear();

        const promesa = Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const orden = docSnap.data();
                const createdAt = orden.createdAt?.toDate?.() || new Date(0);

                if (createdAt < hoy) {
                    const historialRef = doc(
                        db,
                        `restaurants/${restaurant.id}/historial/${añoActual}/ordenes/${docSnap.id}`
                    );
                    await setDoc(historialRef, orden);
                    await deleteDoc(docSnap.ref);
                }
            })
        );

        await toast.promise(promesa, {
            loading: 'Moviendo órdenes antiguas...',
            success: 'Órdenes antiguas archivadas.',
            error: 'Error al mover órdenes',
        });

        // Vibrar si se completó con éxito
        if (navigator.vibrate) {
            navigator.vibrate([150, 30, 150]);
        }
    };

    // Copiar Orden
    const copiarOrdenAlPortapapeles = (order) => {
        const fecha = order.createdAt?.toDate?.().toLocaleString?.() || new Date().toLocaleString();
        const esDomicilio = order.orderType === "Domicilio";
        const esRecoger = order.orderType === "Recoger";

        let texto = `🧾 ORDEN #${order.id}\n`;
        texto += `👤 Cliente: ${order.buyerName}\n`;
        texto += `📅 Fecha: ${fecha}\n`;
        texto += `📱 Teléfono: ${order.phoneNumber}\n`;
        texto += `📦 Tipo: ${order.orderType || 'No especificado'}\n`;
        texto += `💳 Método de pago: ${order.paymentMethod || 'No especificado'}\n`;
        texto += `💵 Estado: ${order.status}\n\n`;

        if (esDomicilio) {
            texto += `🏠 Dirección: ${order.address}, ${order.neighborhood}\n`;
        }

        if (esRecoger && order.sede) {
            const [nombre, ciudad, referencia] = order.sede.split("-");
            texto += `🏢 Sede: ${nombre}\n📍 Ciudad: ${ciudad}\n📌 Referencia: ${referencia}\n`;
        }

        if (order.observaciones) {
            texto += `📝 Observaciones:\n${order.observaciones}\n\n`;
        }

        texto += `🛒 Items:\n`;
        order.items?.forEach(item => {
            texto += ` - ${item.quantity || 1}x ${item.name} ($${item.price?.toLocaleString("es-CL") || "0"})\n`;
        });

        texto += `\n💰 Subtotal: $${order.subtotal?.toLocaleString("es-CL") || "0"}`;
        texto += `\n🚚 Domicilio: $${order.deliveryFee?.toLocaleString("es-CL") || "0"}`;
        texto += `\n🧾 IVA: $${order.tax?.toLocaleString("es-CL") || "0"}`;
        texto += `\n🔸 Total: $${order.total?.toLocaleString("es-CL") || "0"}\n`;

        navigator.clipboard.writeText(texto)
            .then(() => toast.success("Orden copiada al portapapeles"))
            .catch(() => toast.error("Error al copiar la orden"));
    };

    const statusColumns = ['pendiente', 'en preparación', 'lista'];

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} toastOptions={{ style: { marginTop: '60px' } }} />

            <div className="flex flex-col lg:flex-row gap-4 p-4">
                {statusColumns.map(status => (
                    <div
                        key={status}
                        onDrop={(e) => handleDrop(e, status)}
                        onDragOver={allowDrop}
                        className="flex-1 bg-[#111] p-4 rounded-lg min-h-[27.5vh] lg:min-h-[70vh]"
                    >
                        <h2 className="text-xl font-semibold mb-4 capitalize">{status} ({orders.filter(order => status === "pendiente" ? (order.status === "pendiente" || order.status === "por pagar") : order.status === status).length})</h2>
                        {orders
                            .filter(order => status === "pendiente" ? (order.status === "pendiente" || order.status === "por pagar") : order.status === status)
                            .slice()
                            .reverse()
                            .map(order => (
                                <div
                                    key={order.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, order.id)}
                                    className="bg-[#151515] p-5 mb-3 rounded shadow cursor-move border-2 border-[#202020] relative"
                                >
                                    <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                                        {((order.status === "pendiente" || order.status === "por pagar") && order.paymentMethod !== "Efectivo") &&
                                            <ToggleSwitch
                                                checked={order.status == "pendiente"}
                                                onChange={order.status == "pendiente"
                                                    ? (e) => handlePagosTransferencias(e, order, false)
                                                    : (e) => handlePagosTransferencias(e, order, true)}
                                                label={order.status === "por pagar" ? "Sin pagar" : "Pagado"}
                                            />
                                        }
                                        <div className="flex items-center gap-2 cursor-grab">
                                            {order.status === "por pagar" && <AlertCircle className="text-yellow-400 w-4 h-4" />}
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white flex gap-2
                                                ${order.status === "pendiente" ? "bg-red-600"
                                                    : order.status === "en preparación" ? "bg-orange-500"
                                                        : order.status === "lista" ? "bg-green-600"
                                                            : order.status === "por pagar" ? "bg-yellow-600"
                                                                : "bg-gray-500"}`}>
                                                {order.status === "por pagar" ?
                                                    <CreditCardIcon className='w-4 h-4' />
                                                    : order.status === "pendiente" ?
                                                        <ClockIcon className='w-4 h-4' />
                                                        : order.status === "en preparación" ?
                                                            <FlameIcon className='w-4 h-4' />
                                                            : order.status === "lista" ?
                                                                <CheckCircle className='w-4 h-4' />
                                                                : ""}
                                                {order.status}
                                            </span>
                                        </div>
                                        <button
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded flex gap-2 cursor-pointer"
                                            onClick={(e) => handleImpresion(e, order)}
                                            title='Imprimir'
                                        >
                                            <PrinterIcon className='w-4 h-4' />
                                            Imprimir
                                        </button>
                                        {order.status === "lista" && <button
                                            onClick={() => archivarOrden(order)}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2 py-1 rounded flex gap-2 cursor-pointer"
                                            title='Esta acción no se puede deshacer'
                                        >
                                            <Archive className='w-4 h-4' />
                                            Archivar
                                        </button>}
                                        <button
                                            onClick={() => copiarOrdenAlPortapapeles(order)}
                                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded flex gap-2 cursor-pointer"
                                            title='Copiar al portapapeles'
                                        >
                                            📋 Copiar
                                        </button>
                                    </div>

                                    <p className="font-bold text-white">{order.id} | {order.buyerName}</p>

                                    <p className="text-sm text-gray-300">
                                        {order.orderType === "Recoger" ? "Para recoger" : "Para domicilio"} y{" "}
                                        {order.paymentMethod === "Efectivo"
                                            ? "cobrar en efectivo"
                                            : order.paymentMethod === "Transferencia"
                                                ? `se ${order.status === "por pagar" ? "pagará" : "pagó"} por transferencia`
                                                : order.paymentMethod === "Datafono"
                                                    ? `se ${order.status === "por pagar" ? "pagará" : "pagó"} con datáfono`
                                                    : "método de pago no especificado"}
                                    </p>

                                    {order.orderType == "Recoger" && <div className='p-2'>
                                        <p className="text-sm text-gray-500">{order.sede.split("-")[0] || ""}</p>
                                        <p className="text-sm text-gray-500">{order.sede.split("-")[1] || ""}</p>
                                        <p className="text-sm text-gray-500">{order.sede.split("-")[2] || ""}</p>
                                    </div>}

                                    {order.orderType == "Domicilio" && <div className='p-2'>
                                        <p className="text-sm text-gray-500 w-[56%] leading-tight">
                                            <span className="font-bold">Dirección:</span> {order.address}<br />
                                            <span className="ml-[5%]">{order.neighborhood}</span>
                                        </p>
                                    </div>}
                                    <a className="text-sm text-gray-400 hover:text-white hover:underline" href={'https://wa.me/57' + order.phoneNumber} target="_blank" title='Abrir en whatsapp'> <span className="font-bold">Contacto:</span> {order.phoneNumber}</a>


                                    <ul className="mt-2 text-sm text-gray-300 space-y-1">
                                        <li>
                                            <button
                                                onClick={() => toggleDetails(order.id)}
                                                className="text-xs text-blue-400 hover:text-blue-200 underline mt-2 cursor-pointer"
                                            >
                                                {openDetails[order.id] ? "Ocultar Detalles" : "Ver Detalles"}
                                            </button>
                                        </li>
                                        {openDetails[order.id] && (
                                            <>
                                                {order.observaciones && (
                                                    <li className="mt-3 my-2 p-4 border border-yellow-600 bg-yellow-900/20 text-sm text-yellow-100 rounded">
                                                        <div className="flex items-center mb-1 font-semibold">
                                                            <AlertCircle className="w-4 h-4 mr-2" />
                                                            Observaciones
                                                        </div>
                                                        <div className="font-normal">{order.observaciones}</div>
                                                    </li>
                                                )}

                                                {order.items?.map((item, idx) => {
                                                    const quantity = item.quantity || 1;
                                                    const unitPrice = item.price || 0;
                                                    const itemTotal = quantity * unitPrice;
                                                    return (
                                                        <li key={idx} className="flex justify-between items-start">
                                                            <div>
                                                                <div className="font-semibold text-white"><span className='text-lg text-yellow-500'>{quantity} x</span> {item.name}</div>
                                                                <div className="text-xs text-gray-400">
                                                                    ${unitPrice.toLocaleString("es-CL")} {quantity !== "1" ? "c/u" : ""}
                                                                </div>
                                                            </div>
                                                            <div className="text-right font-medium text-yellow-200">
                                                                ${itemTotal.toLocaleString("es-CL")}
                                                            </div>
                                                        </li>
                                                    );
                                                })}

                                                <li className="flex justify-between pt-3 border-t border-gray-700 text-sm text-gray-300 font-medium">
                                                    <span>Subtotal</span>
                                                    <span>${order.subtotal?.toLocaleString("es-CL") || "0"}</span>
                                                </li>
                                                <li className="flex justify-between text-sm text-gray-300">
                                                    <span>Domicilio</span>
                                                    <span>${order.deliveryFee?.toLocaleString("es-CL") || "0"}</span>
                                                </li>
                                                <li className="flex justify-between text-sm text-gray-300">
                                                    <span>Iva</span>
                                                    <span>${order.tax?.toLocaleString("es-CL") || "0"}</span>
                                                </li>
                                            </>
                                        )}

                                        <li className="mt-2 pt-2 border-t border-yellow-500 flex justify-between items-center text-sm font-bold text-yellow-300">
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                Total
                                            </div>
                                            <span className="text-base">
                                                ${order.total?.toLocaleString("es-CL") || "0"}
                                            </span>
                                        </li>


                                    </ul>

                                </div>
                            ))}
                    </div>
                ))}
            </div>

            {/* Opciones de Administrador */}
            <div className="flex-1 p-4 mx-4 rounded bg-[#111]">
                <h3 className='text-center text-xl font-semibold'>Acciones Globales</h3>
                <div className="flex flex-row border-t gap-4 mt-2 p-2">

                    <button
                        onClick={moverOrdenesAntiguas}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium px-4 py-2 rounded cursor-pointer flex items-center gap-2"
                        title='Envia las órdenes de ayer al archivo'
                    >
                        <Archive className='w-4 h-4' />
                        Archivar órdenes del día anterior
                    </button>

                </div>
            </div>
        </>
    );
}
