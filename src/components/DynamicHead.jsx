import { Helmet } from 'react-helmet-async';
import { useLocation } from "react-router-dom";
import { useRestaurant } from "../contexts/RestaurantContext";

export default function DynamicHead() {
  const location = useLocation();
  const { restaurant } = useRestaurant();

  if (!restaurant) return null;

  // Título según la ruta
  let title = restaurant.name;
  if (location.pathname === "/admin") title += " | Admin";
  else if (location.pathname === "/carta") title += " | Carta";

  const description = restaurant.description || `Descubre la carta de ${restaurant.name} y realiza pedidos online.`;
  const favicon = restaurant.logo || "/favicon.png";
  const canonical = `https://${window.location.host}${location.pathname}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={restaurant.desc} />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <link rel="canonical" href={canonical} />
      <link rel="icon" type="image/png" href={favicon} />
    </Helmet>
  );
}
