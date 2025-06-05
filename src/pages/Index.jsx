import React from "react";
// Providers
import { useRestaurant } from "../contexts/RestaurantContext";
import { useAuth } from "../contexts/AuthContext";
// others
import theme from "../theme";

export default function Index() {
  const { restaurant } = useRestaurant();
  const { user, loading } = useAuth();

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
    <div className={`${theme.layout.darkBackground} min-h-screen flex flex-col`}>
      {/* Header sesión */}
      <div className="flex justify-end p-2 pr-4 text-xs text-gray-400">
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
        <img
          src={restaurant.logo}
          alt={"Logo de "+restaurant.name}
          width="1000" 
          height="1000"
          className="w-50 max-w-xs rounded-xl shadow-lg"
          loading="lazy"
        />
        <div className="space-y-1">
          <h1 className={`text-xl md:text-2xl ${theme.text.bold} ${theme.text.yellow}`}>
            {restaurant.name}
          </h1>
          <p className="text-xs md:text-sm text-gray-300 leading-relaxed max-w-sm">
            {restaurant.subtitle}
          </p>
        </div>
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

      <footer className="text-[0.6rem] text-gray-500 opacity-60 text-center px-4 pb-4">
        © 2025. Todos los derechos reservados. *Aplican condiciones. Promociones válidas solo en canales seleccionados. Imágenes de referencia. Los precios, productos y disponibilidad pueden variar. Esta plataforma actúa como intermediario entre el cliente y el restaurante. Para cualquier inconveniente, por favor comuníquese directamente con el establecimiento.
      </footer>
    </div>
  );
}