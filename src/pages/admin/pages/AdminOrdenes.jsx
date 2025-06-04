import { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc, runTransaction, getDocs, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from "../../../firebase/firebase.js";
import firestoreService from '../../../servicies/firestoreService';
import { useRestaurant } from '../../../contexts/RestaurantContext.jsx';

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
        await updateDoc(orderRef, { status: newStatus });
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
                const padded = String(next).padStart(4, '0'); // e.g. '0001'
                const orderId = `${year}${padded}`;

                // actualiza el contador
                transaction.set(counterDocRef, { count: next }, { merge: true });

                // crea la orden con ese ID
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
                    status: 'pendiente'
                };
                transaction.set(orderRef, dummyOrder);

                return orderId;
            });

            console.log(`Orden creada con ID ${newOrderId}`);
        } catch (error) {
            console.error('Error al crear la orden con ID personalizado:', error);
        }
    };

    const moverOrdenesAntiguas = async () => {
        if (!restaurant?.id) return;

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Desde medianoche

        const ordenesRef = collection(db, `restaurants/${restaurant.id}/ordenes`);
        const snapshot = await getDocs(ordenesRef);

        const añoActual = new Date().getFullYear();

        const promesas = snapshot.docs.map(async (docSnap) => {
            const orden = docSnap.data();
            const createdAt = orden.createdAt?.toDate?.() || new Date(0); // manejo de Timestamp

            if (createdAt < hoy) {
                const historialRef = doc(
                    db,
                    `restaurants/${restaurant.id}/historial/${añoActual}/ordenes/${docSnap.id}`
                );
                await setDoc(historialRef, orden);     // Copia
                await deleteDoc(docSnap.ref);          // Elimina de activo
            }
        });

        await Promise.all(promesas);
        console.log('Órdenes antiguas movidas al historial.');
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
                                className="bg-[#151515] p-3 mb-3 rounded shadow cursor-move border-2"
                            >
                                <p className="font-bold">{order.buyerName}</p>
                                <p className="text-sm text-gray-500">{order.address}</p>
                                <button
                                    className="mt-2 text-blue-600 hover:underline text-sm"
                                    onClick={(e) => handleImpresion(e, order)}
                                >
                                    Imprimir
                                </button>
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
                    className="bg-gray-900 hover:bg-gray-950 text-white px-4 py-2 rounded "
                >
                    Crear orden de prueba
                </button>

            </div>
        </div>

    </>);
}