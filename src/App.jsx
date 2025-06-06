import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// services
import firestoreService from "./servicies/firestoreService";
import { auth } from "./firebase/firebase.js";
import { signOut } from "firebase/auth";
// contexts
import { RestaurantProvider } from "./contexts/RestaurantContext.jsx";
import { CartProvider } from "./contexts/CartContext.jsx"
import { useAuth } from "./contexts/AuthContext";
// others
import domains from "./domains.json";
import theme from "./theme";
// Pages
import Index from "./pages/Index";
import Carta from "./pages/client/Carta";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import DynamicHead from "./components/DynamicHead.jsx";

// Componente para mostrar Login o Dashboard según sesión
function AdminRoute() {
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(null); // null = pendiente, true = ok, false = no autorizado
  const [loginError, setLoginError] = useState(""); // almacena mensajes de error

  const restaurantId =
    domains[window.location.host.toLowerCase()] || domains["default"];

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        setLoginError(""); // no hay usuario logueado aún
        setIsAuthorized(false);
        return;
      }

      try {
        const userDoc = await firestoreService.findById("users", user.uid);

        if (!userDoc) {
          console.warn("Usuario no encontrado en Firestore.");
          await signOut(auth);
          setLoginError("Usuario no registrado.");
          setIsAuthorized(false);
          return;
        }

        const resolvedUser = await firestoreService.deepResolveReferences(userDoc);

        if (resolvedUser.restaurant?.id === restaurantId) {
          setIsAuthorized(true);
        } else {
          console.warn("Usuario no autorizado para este restaurante.");
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

function App() {
  const hostname = window.location.host.toLowerCase();
  const id = domains[hostname] || domains["default"];

  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    firestoreService.findById("restaurants", id).then(setRestaurant);
  }, [id]);

  if (!restaurant) {
    return (
      <div className={`${theme.layout.darkBackground} min-h-screen flex items-center justify-center`}>
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

export default App;