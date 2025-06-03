import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Services
import firestoreService from "./servicies/firestoreService";
// Providers
import { RestaurantProvider } from "./contexts/RestaurantContext";
import { AuthProvider } from "./contexts/AuthContext";
// Others
import domains from "./domains.json";
import theme from "./theme";
// Pages
import Index from "./pages/Index"
import Carta from "./pages/client/Carta"
import Dashboard from "./pages/admin/Dashboard"

function App() {
  const id =
    domains[
    window.location.host.includes("localhost")
      ? "default"
      : window.location.host.toLowerCase()
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
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index/>} />
            <Route path="/carta" element={<Carta />} />
            <Route path="/admin" element={<Dashboard />} />
          </Routes>
        </Router>
      </AuthProvider>
    </RestaurantProvider>
  );
}

export default App;