import React, { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Firebase y servicios
import { auth } from "./firebase/firebase";
import { signOut } from "firebase/auth";
import firestoreService from "./servicies/firestoreService";

// Contextos
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { RestaurantProvider } from "./contexts/RestaurantContext";
import { CartProvider } from "./contexts/CartContext";

// Config
import domains from "./domains.json";
import theme from "./theme";
import "./index.css";

// Páginas
import Index from "./pages/Index.jsx";
import Carta from "./pages/client/Carta";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import DynamicHead from "./components/DynamicHead";

// Ruta protegida
function AdminRoute() {
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [loginError, setLoginError] = useState("");

  const restaurantId = domains[window.location.host.toLowerCase()] || domains["default"];

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        setLoginError("");
        setIsAuthorized(false);
        return;
      }

      try {
        const userDoc = await firestoreService.findById("users", user.uid);
        if (!userDoc) {
          await signOut(auth);
          setLoginError("Usuario no registrado.");
          setIsAuthorized(false);
          return;
        }

        const resolvedUser = await firestoreService.deepResolveReferences(userDoc);

        if (resolvedUser.restaurant?.id === restaurantId) {
          setIsAuthorized(true);
        } else {
          await signOut(auth);
          setLoginError("No tienes permiso para acceder a este restaurante.");
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error verificando autorización:", error);
        setLoginError("Ocurrió un error al verificar tu sesión.");
        setIsAuthorized(false);
      }
    };

    if (!loading) {
      checkAuthorization();
    }
  }, [loading, user, restaurantId]);

  if (loading || isAuthorized === null) {
    return <div className="text-white p-10">Verificando sesión...</div>;
  }

  return isAuthorized ? <Dashboard /> : <Login error={loginError} />;
}

function AppWrapper() {
  const hostname = window.location.host.toLowerCase();
  const id = domains[hostname] || domains["default"];
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    firestoreService.findById("restaurants", id).then((data) => {
      const estaAbierto = calcularEstadoAbierto(data?.horarios);
      setRestaurant({ ...data, estaAbierto });
    });
  }, [id]);

  // Horarios de atencion
  function calcularEstadoAbierto(horariosString) {
    if (!horariosString) return false;

    try {
      const horarios = JSON.parse(horariosString);

      const ahora = new Date();
      const dia = ahora.toLocaleDateString('es-CO', {
        weekday: 'long',
        timeZone: 'America/Bogota',
      }).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      const horaActualStr = ahora.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/Bogota',
      });

      const rango = horarios[dia]; // ej: "18:00-00:00"
      if (!rango || !rango.includes("-")) return false;

      const [inicio, fin] = rango.split("-");

      const aMinutos = (hhmm) => {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
      };

      const ahoraMin = aMinutos(horaActualStr);
      const inicioMin = aMinutos(inicio);
      const finMin = aMinutos(fin);

      // 🕐 si el rango cruza medianoche, ej: 18:00-00:00
      if (inicioMin > finMin) {
        return ahoraMin >= inicioMin || ahoraMin < finMin;
      }

      return ahoraMin >= inicioMin && ahoraMin < finMin;
    } catch (e) {
      console.error("Error evaluando horarios:", e);
      return false;
    }
  }

  if (!restaurant) {
    return (
      <div className={`${theme.layout.darkBackground} [min-height:100dvh] flex items-center justify-center`}>
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <RestaurantProvider value={{ id, restaurant }}>
      <CartProvider>
        <Router>
          <DynamicHead />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/carta" element={<Carta />} />
            <Route path="/admin" element={<AdminRoute />} />
          </Routes>
        </Router>
      </CartProvider>
    </RestaurantProvider>
  );
}

// ✅ Render final correcto
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);