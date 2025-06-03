import React from "react";
import theme from "../theme";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Index({ imageurl, buttons = [], title = "Promoción Especial", subtitle = "2x1 en combos seleccionados." }) {

  const { user, loading } = useAuth();

  return (
    <div className={`${theme.layout.darkBackground} min-h-screen flex flex-col`}>

      {/* Header opcional para el estado de sesión */}
      <div className="flex justify-end p-2 pr-4 text-xs text-gray-400">
        {loading ? (
          <span>Cargando sesión...</span>
        ) : user ? (
          <span className="">Sesión activa como {user.email}</span>
        ) : (
          <span className="">Sesión no iniciada</span>
        )}
      </div>

      {/* Contenido principal con flex-grow */}
      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-[10%] md:px-[25%] text-center space-y-5 py-10">

        {/* Imagen */}
        <img
          src={imageurl}
          alt="Promo"
          className="w-50 max-w-xs rounded-xl shadow-lg"
        />

        {/* Título y subtítulo */}
        <div className="space-y-1">
          <h1 className={`text-xl md:text-2xl ${theme.text.bold} ${theme.text.yellow}`}>
            {title}
          </h1>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-sm">
            {subtitle}
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
          {buttons.map((btn, index) => (
            <button
              key={index}
              onClick={btn.onClick}
              className={`${theme.buttons[btn.style] || theme.buttons.primary} w-full`}
            >
              {btn.text}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-[0.6rem] text-gray-500 opacity-60 text-center px-4 pb-4">
        © 2025. Todos los derechos reservados. *Aplican condiciones. Promociones válidas solo en canales seleccionados. Imágenes de referencia. Los precios, productos y disponibilidad pueden variar. Esta plataforma actúa como intermediario entre el cliente y el restaurante. Para cualquier inconveniente, por favor comuníquese directamente con el establecimiento.
      </footer>
    </div>
  );
}

