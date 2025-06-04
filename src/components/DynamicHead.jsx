import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRestaurant } from "../contexts/RestaurantContext";

export default function DynamicHead() {
  const location = useLocation();
  const { restaurant } = useRestaurant();

  useEffect(() => {
    if (!restaurant) return;

    // Título según ruta
    let title = restaurant.name;
    if (location.pathname === "/admin") title += " | Admin";
    else if (location.pathname === "/carta") title += " | Carta";

    document.title = title;

    // Favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement("link");
    link.type = "image/png";
    link.rel = "icon";
    link.href = restaurant.logo || "/favicon.png";
    document.head.appendChild(link);
  }, [location, restaurant]);

  return null;
}
