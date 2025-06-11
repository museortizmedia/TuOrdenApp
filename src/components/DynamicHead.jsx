import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useRestaurant } from "../contexts/RestaurantContext";

export default function DynamicHead() {
  const location = useLocation();
  const { restaurant } = useRestaurant();

  // Evitar aplicar en la ruta raíz
  //if (!restaurant || location.pathname === "/") return null;

  let title = restaurant.name;
  if (location.pathname === "/admin") title += " | Admin";
  else if (location.pathname === "/carta") title += " | Carta";

  const baseDescription = restaurant.description || `Descubre ${restaurant.name}.`;

  const description =
    location.pathname === "/"
      ? `${restaurant.name}. ${baseDescription}`
      : location.pathname === "/carta"
        ? `Consulta la carta de ${restaurant.name}. ${baseDescription}`
        : `Panel administrativo de ${restaurant.name}. ${baseDescription}`;

  const canonical = `https://${window.location.host}${location.pathname}`;
  const shouldIndex = location.pathname !== "/admin";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={shouldIndex ? "index, follow" : "noindex, nofollow"} />
      <link rel="canonical" href={canonical} />
    </Helmet>
  );
}