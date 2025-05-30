# Tu Orden App

Permite a restaurantes gestionar sus órdenes, gestionar la carta, y a los usuarios crear pedidos y ver su carrito de compras desde el móvil.

## 🌐 Tecnologías

### Frontend
- **Framework:** [Vite](https://vitejs.dev/) + **React**
- **Estilos:** [TailwindCSS](https://tailwindcss.com/docs/installation/using-vite) (estilo moderno y plano)
- **Hosting:** [Vercel](https://vercel.com/) (gratis con dominio personalizado)
- **Dominio:** proveído por el cliente

### Backend (Serverless)
- **Autenticación:** [Firebase]( https://console.firebase.google.com/) Auth
- **Base de Datos:** [Firebase]( https://console.firebase.google.com/) Firestore
- **Almacenamiento de Imágenes:** [Firebase]( https://console.firebase.google.com/) Storage
- **Funciones API (backend):** [Firebase]( https://console.firebase.google.com/) Cloud Functions (Node.js + Express)

## 🔧 Entorno de desarrollo

- Desarrollo iterativo en producción (CI/CD con Vercel)
- Estructura preparada para multi-restaurante y multi-sede
- Código dividido en módulos por rol: cliente, admin, superadmin

## 💡 Alcance Inicial (v1.0 MVP)

### Para clientes (móvil):
- Ver menú por categoría
- Agregar al carrito
- Ingresar datos de despacho (retiro, domicilio)
- Seleccionar método de pago
- Enviar pedido por WhatsApp (con número de orden)

### Para administradores (PC):
- Login con credenciales
- Ver pedidos en tiempo real (Firestore listener)
- Marcar como "en despacho"
- CRUD de productos y categorías
- Historial de órdenes
- Impresión de orden (soporte para impresora térmica)

---

## 📦 Plan de desarrollo (iterativo y desplegado desde el inicio)

### ✅ Semana 1 — Configuración y despliegue inicial
- [ ] Crear proyecto en Firebase (Auth, Firestore, Storage, Functions)
- [ ] Crear proyecto Vite + React + Tailwind
- [ ] Crear repositorio Git + conectar con Vercel
- [ ] Desplegar frontend base en producción con dominio
- [ ] Crear primera función Firebase (`/ping`) para verificar backend

### ✅ Semana 2 — Interfaz cliente (menú)
- [ ] Crear interfaz de menú (por categoría)
- [ ] Lógica de carrito en React
- [ ] Botón flotante para ayuda por WhatsApp
- [ ] Enviar pedido simulado por WhatsApp (sin Firestore aún)

### ✅ Semana 3 — Backend de pedidos
- [ ] Crear estructura Firestore (restaurantes, productos, pedidos)
- [ ] Guardar pedido real en Firestore
- [ ] Asociar pedido con sede y método de pago
- [ ] Envío del número de orden por WhatsApp

### ✅ Semana 4 — Panel de administrador
- [ ] Autenticación básica Firebase Auth
- [ ] Mostrar pedidos actuales (realtime)
- [ ] Botón para marcar como “en despacho”
- [ ] Impresión básica en PDF o texto (simulación para térmica)

### ✅ Semana 5 — CRUD productos y categorías
- [ ] Crear / editar producto con imagen
- [ ] Crear / editar categorías
- [ ] Asignar productos a categorías

### ✅ Semana 6 — Multi-restaurante (admin general)
- [ ] Estructura Firestore para múltiples restaurantes y sedes
- [ ] Panel para seleccionar restaurante y sede
- [ ] Login del administrador limitado a su restaurante/sede

---

## 📁 Estructura recomendada del proyecto

```bash
/tu-orden-app
├── /src
│   ├── /components
│   ├── /pages
│   │   ├── index.jsx
│   │   ├── /admin
│   │   ├── /cliente
│   │   └── /api            # Aquí van tus funciones backend
│   │       ├── crearOrden.js
│   │       └── productos.js
│   ├── /services           # Firebase config, helpers para Firestore/Auth
│   └── main.jsx
├── /public
├── tailwind.config.js
├── firebase-config.js      # (solo si decides no usar un wrapper)
└── README.md