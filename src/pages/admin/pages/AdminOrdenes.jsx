import { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc, runTransaction, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from "../../../firebase/firebase.js";
import firestoreService from '../../../servicies/firestoreService';
import { useRestaurant } from '../../../contexts/RestaurantContext.jsx';
import toast, { Toaster } from 'react-hot-toast';


export default function AdminOrdenes() {
    const { restaurant } = useRestaurant();

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!restaurant?.id) return; // Asegura que restaurant esté cargado

        const ordersRef = collection(db, `restaurants/${restaurant.id}/ordenes`);
        const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(data);
        });

        return () => unsubscribe();
    }, [restaurant?.id]);

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

    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        const orderId = e.dataTransfer.getData('text/plain');
        updateOrderStatus(orderId, newStatus);
    };

    const allowDrop = (e) => {
        e.preventDefault();
    };

    const handleDragStart = (e, orderId) => {
        e.dataTransfer.setData('text/plain', orderId);
    };

    const createDummyOrder = async () => {
        const restaurantId = restaurant.id;
        const year = new Date().getFullYear();
        const counterDocRef = doc(db, `restaurants/${restaurantId}/counters/${year}`);

        try {
            const newOrderId = await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterDocRef);
                let current = 0;

                if (counterDoc.exists()) {
                    current = counterDoc.data().count || 0;
                }

                const next = current + 1;
                const padded = String(next).padStart(4, '0');
                const orderId = `${year}${padded}`;

                transaction.set(counterDocRef, { count: next }, { merge: true });

                const orderRef = doc(db, `restaurants/${restaurantId}/ordenes/${orderId}`);
                const dummyOrder = {
                    createdAt: new Date(),
                    items: [],
                    subtotal: 0,
                    total: 0,
                    deliveryFee: 0,
                    tax: 0,
                    buyerName: 'Test Cliente',
                    address: 'Calle Ficticia 123',
                    neighborhood: 'Centro',
                    phoneNumber: 3001231234,
                    status: 'pendiente'
                };
                transaction.set(orderRef, dummyOrder);

                return orderId;
            });

            toast.success(`Orden de prueba creada (#${newOrderId})`);
            if (navigator.vibrate) { navigator.vibrate(100) }
        } catch (error) {
            console.error('Error al crear la orden de prueba:', error);
            toast.error('Error al crear orden de prueba');
            if (navigator.vibrate) { navigator.vibrate(100, 50, 100) }
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

    const handleImpresion = (e, order) => {
        e.preventDefault();

        const width = 500; // 300 píxeles, aprox. 80mm
        const height = 800;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const win = window.open('', '', `width=${width},height=${height},left=${left},top=${top}`);
        if (!win) return;

        const fecha = order.createdAt?.toDate?.().toLocaleString?.() || new Date().toLocaleString();
        const itemsHtml = order.items?.map(item => `
        <tr>
            <td>1x</td>
            <td>${item.name || 'Producto'}</td>
            <td style="text-align:right;">$${(item.price || 0).toFixed(2)}</td>
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
                @page {
                size: 80mm auto;
                margin: 0;
                }
                body {
                margin: 0;
                padding: 0;
                width: 80mm;
                }
            }

            body {
                font-family: monospace;
                width: 80mm;
                margin: 0 auto;
                padding: 10px;
                color: black;
            }

          .center {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
          }
          .boxed {
            border: 2px solid black;
            padding: 10px;
            margin: 10px 0;
            font-size: 18px;
            font-weight: bold;
          }
          table {
            width: 100%;
            margin-top: 10px;
          }
          td {
            font-size: 14px;
            padding: 4px 0;
          }
          .totales td {
            font-weight: bold;
            font-size: 14px;
          }
          .total-final {
            font-size: 18px;
            font-weight: bold;
          }
          hr {
            border: none;
            border-top: 2px solid black;
            margin: 12px 0;
          }
        </style>
      </head>
      <body>
        <div class="center">${order.buyerName}</div>

        <div class="boxed">ORDEN #${order.id}</div>

        <div>${restaurant?.name || 'Restaurante'}</div>
        <div><strong>Fecha orden:</strong> ${fecha}</div>

        <div class="boxed">DETALLE ORDEN</div>

        <table>
          ${itemsHtml}
        </table>

        <hr />

        <table class="totales">
          <tr><td>Subtotal</td><td></td><td style="text-align:right;">$${subtotal.toFixed(2)}</td></tr>
          <tr><td>Impuestos</td><td></td><td style="text-align:right;">$${tax.toFixed(2)}</td></tr>
          <tr><td>Domicilio</td><td></td><td style="text-align:right;">$${delivery.toFixed(2)}</td></tr>
        </table>

        <div class="total-final" style="margin-top:10px;">TOTAL: $${total.toFixed(2)}</div>

        <hr />

        <div><strong>Cliente:</strong> ${order.buyerName}</div>
        <div><strong>Dirección:</strong> ${order.address}</div>
        <div><strong>Barrio:</strong> ${order.neighborhood}</div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 500); // cerrar automáticamente
          }
        </script>
      </body>
    </html>
    `;

        win.document.open();
        win.document.write(html);
        win.document.close();
    };

    const statusColumns = ['pendiente', 'en preparación', 'lista'];

    return (<>
        <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
                style: {
                    marginTop: '60px'
                }
            }}
        />
        <div className="flex gap-4 p-4">
            {statusColumns.map(status => (
                <div
                    key={status}
                    onDrop={(e) => handleDrop(e, status)}
                    onDragOver={allowDrop}
                    className="flex-1 bg-[#111] p-4 rounded-lg min-h-[400px] "
                >
                    <h2 className="text-xl font-semibold mb-4 capitalize">{status}</h2>
                    {orders
                        .filter(order => order.status === status)
                        .map(order => (
                            <div
                                key={order.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, order.id)}
                                className="bg-[#151515] p-5 mb-3 rounded shadow cursor-move border-2 border-[#202020] relative"
                            >
                                {/* Botón de impresión arriba a la derecha */}
                                <div className="absolute top-3 right-3 flex flex-col gap-y-2">
                                    <p className={`inline-block px-2 py-1 rounded text-xs font-semibold text-center text-white ${order.status === 'pendiente' ? 'bg-red-600' : order.status === 'en preparación' ? 'bg-orange-500' : order.status === 'lista' ? 'bg-green-600' : 'bg-gray-500'}`}>
                                        {order.status || ""}
                                    </p>
                                    <button
                                        className=" bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
                                        onClick={(e) => handleImpresion(e, order)}
                                    >
                                        Imprimir
                                    </button>
                                </div>

                                <p className="font-bold">{order.buyerName}</p>
                                <p className="text-sm">{order.id}</p>
                                <p className="text-sm text-gray-500">{order.address}</p>

                                <ul className="mt-2 text-sm text-gray-300">
                                    {order.items?.map((item, idx) => (
                                        <li key={idx} className="flex justify-between">
                                            <span className="font-normal">
                                                <span className="font-bold">{item.quantity || 1}x</span> {item.name}
                                            </span>
                                            <span className="font-normal">
                                                ${(item.price || 0).toLocaleString('es-CL')}
                                            </span>
                                        </li>
                                    ))}
                                </ul>



                            </div>

                        ))}
                </div>
            ))}

        </div>

        {/* Opciones de Administrador */}
        <div className="flex-1 p-4 mx-4 bg-[#111]">
            <div className="flex flex-wrap gap-4">

                <button
                    onClick={moverOrdenesAntiguas}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded "
                >
                    Limpiar Ordenes
                </button>

                <button
                    onClick={createDummyOrder}
                    className="bg-gray-900 hover:bg-gray-950 text-white px-4 py-2 rounded hidden"
                >
                    Crear orden de prueba
                </button>

            </div>
        </div>

    </>);
}