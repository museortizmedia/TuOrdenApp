import React, { useState } from "react";
// Providers
import { useRestaurant } from "../contexts/RestaurantContext";
import { useAuth } from "../contexts/AuthContext";
// Servicios
//import supabaseService from "../servicies/supabaseService.js"
// others
import theme from "../theme";

export default function Index() {
  const { restaurant } = useRestaurant();
  const { user, loading } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);

  const buttons = [
    {
      text: "Reservar",
      onClick: () =>
        restaurant.whatsapp && window.open(restaurant.whatsapp, "_blank"),
      style: "primary",
    },
    {
      text: "Ver Carta",
      onClick: () => (window.location.href = "/carta"),
      style: "secondary",
    },
  ];

  return (
    <div className={`${theme.layout.darkBackground} [min-height:120dvh] flex flex-col`}>
      {/* Header sesión */}
      <div className="flex justify-end p-2 pr-4 text-xs text-gray-400 invisible md:visible">
        {loading ? (
          <span>Cargando sesión...</span>
        ) : user ? (
          <span>Sesión activa como {user.email}</span>
        ) : (
          <span>Sesión no iniciada</span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-[10%] md:px-[25%] text-center space-y-5 py-10">

        {/* Imagen con carga optimizada */}
        <div className="relative w-50 max-w-xs">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-700 animate-pulse rounded-xl" />
          )}
          <img
            src={restaurant.logo}
            srcSet={`
              ${restaurant.logo}?w=300 300w,
              ${restaurant.logo}?w=600 600w,
              ${restaurant.logo}?w=1000 1000w
            `}
            sizes="(max-width: 768px) 80vw, 300px"
            width={300}
            height={300}
            alt={"Logo de " + restaurant.name}
            className={`rounded-xl shadow-lg w-full transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            loading="eager"
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Nombre y subtítulo */}
        <div className="space-y-1">
          <h1 className={`text-xl md:text-2xl ${theme.text.bold} ${theme.text.yellow}`}>
            {restaurant.name}
          </h1>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-sm">
            {restaurant.subtitle}
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
          {buttons.map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              className={`${theme.buttons[btn.style] || theme.buttons.primary} w-full`}
            >
              {btn.text}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-xs text-gray-400 text-center px-4 pb-6 leading-snug opacity-60 hover:opacity-80 transition-opacity duration-300">
        <div className="max-w-xl mx-auto">
          © 2025. Todos los derechos reservados. <br className="hidden md:inline" />
          *Aplican condiciones. Promociones válidas solo en canales seleccionados. <br className="hidden md:inline" />
          Imágenes de referencia. Los precios, productos y disponibilidad pueden variar. <br className="hidden md:inline" />
          Esta plataforma actúa como intermediario entre el cliente y el restaurante. <br className="hidden md:inline" />
          Para cualquier inconveniente, por favor comuníquese directamente con el establecimiento.
        </div>
      </footer>
    </div>
  );
}