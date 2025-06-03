import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// services
import firestoreService from "./servicies/firestoreService";
// contexts
import { RestaurantProvider } from "./contexts/RestaurantContext";
import { useAuth } from "./contexts/AuthContext";
// others
import domains from "./domains.json";
import theme from "./theme";
// Pages
import Index from "./pages/Index";
import Carta from "./pages/client/Carta";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";

// Componente para mostrar Login o Dashboard según sesión
function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-white p-10">Verificando sesión...</div>;

  return user ? <Dashboard /> : <Login />;
}

function App() {
  const id = domains[
    window.location.host.includes("localhost") ? "default" : window.location.host.toLowerCase()
  ];

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
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/carta" element={<Carta />} />
          <Route path="/admin" element={<AdminRoute />} />
        </Routes>
      </Router>
    </RestaurantProvider>
  );
}

export default App;