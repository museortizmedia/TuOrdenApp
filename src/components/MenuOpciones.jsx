import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

/*
<MenuOpciones
  opciones={[
    { label: "Editar", onClick: () => console.log("Editar presionado") },
    { label: "Eliminar", onClick: () => console.log("Eliminar presionado") },
    { label: "Restaurar", onClick: () => alert("Restaurado") }
  ]}
/>
*/
export default function MenuOpciones({ opciones = [] }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const wrapperRef = useRef(null);

  const toggleMenu = () => setMenuAbierto((prev) => !prev);

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setMenuAbierto(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpcionClick = (accion) => {
    accion(); // Ejecuta la función pasada
    setMenuAbierto(false); // Cierra el menú
  };

  return (
    <div ref={wrapperRef} className="relative inline-block text-left">
      <button onClick={toggleMenu}>
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {menuAbierto && (
        <div className="absolute right-0 mt-2 w-40 bg-black/90 border rounded shadow-lg text-sm text-white z-50">
          {opciones.map((opcion, index) => (
            <button
              key={index}
              onClick={() => handleOpcionClick(opcion.onClick)}
              className="w-full px-4 py-2 text-left hover:bg-gray-400"
            >
              {opcion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}