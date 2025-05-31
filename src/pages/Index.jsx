import React from "react";
import theme from "../theme";

export default function Index({ imageurl, buttons = [] }) {
  return (
    <div className={`${theme.layout.darkBackground} min-h-screen flex items-center justify-center`}>
      <div className="w-full max-w-screen-xl px-[10%] md:px-[25%] flex flex-col items-center text-center space-y-5 py-10">
        
        {/* Imagen desde props */}
        <img
          src={imageurl}
          alt="Promo"
          className="w-50 max-w-xs rounded-xl shadow-lg"
        />

        {/* Título y subtítulo */}
        <div className="space-y-1">
          <h1 className={`text-xl md:text-2xl ${theme.text.bold} ${theme.text.yellow}`}>
            Promoción Especial
          </h1>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-sm">
            2x1 en combos seleccionados.
          </p>
        </div>

        {/* Botones dinámicos */}
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

        {/* Nota final */}
        <p className="text-[0.6rem] text-gray-500 mt-8 leading-tight max-w-xs">
          *Aplican condiciones. Promoción válida solo en canales seleccionados para entregas a domicilio. Imagen de referencia.
        </p>
      </div>
    </div>
  );
}
