import React from "react";
import { X } from "lucide-react";

export default function CartOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white text-black p-6 relative shadow-lg">
        {/* Cerrar */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Tu carrito</h2>

        {/* Contenido del carrito (vacío por ahora) */}
        <p>Aquí irán los productos seleccionados...</p>
      </div>
    </div>
  );
}