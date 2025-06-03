import React, { useState } from "react";
import { useRestaurant } from "../contexts/RestaurantContext";
import { ShoppingCartIcon, X } from "lucide-react";
import CartOverlay from "../components/CartOverlay";

export default function CartaLayout({ children }) {
  const { restaurant } = useRestaurant();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-gray-800 shadow-md">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={restaurant.logo} alt="Logo" className="h-8 w-auto" />
          <span className="text-lg font-bold">{restaurant.name}</span>
        </div>

        {/* Cart Button */}
        <button onClick={() => setIsCartOpen(true)} className="relative">
          <ShoppingCartIcon className="w-6 h-6 text-yellow-400" />
          {/* Podrías agregar un contador de items aquí */}
        </button>
      </header>

      {/* Main content */}
      <main className="p-4">{children}</main>

      {/* Overlay del carrito */}
      {isCartOpen && (
        <CartOverlay onClose={() => setIsCartOpen(false)} />
      )}
    </div>
  );
}
