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
  else if (location.pathname === "/") title += " | Comida a domicilio";

  const description =
    location.pathname === "/"
      ? restaurant.description || `Explora ${restaurant.name}.`
      : restaurant.description || `Descubre la carta de ${restaurant.name}.`;

  const favicon = restaurant.logo || "/favicon.png";
  const canonical = `https://${window.location.host}${location.pathname}`;
  const shouldIndex = location.pathname !== "/admin";

  return (
    <Helmet>
      <title>{title}</title>

      {/* SEO básico */}
      <meta name="description" content={restaurant.desc} />
      <meta name="robots" content={shouldIndex ? "index, follow" : "noindex, nofollow"} />

      {/* SEO internacional - idioma */}
      <link rel="alternate" href={canonical} hreflang="es" />

      {/* SEO geográfico */}
      <meta name="geo.region" content="CO" />
      <meta name="geo.placename" content="Jamundí" />
      <meta name="geo.position" content="3.26289;-76.5384" />
      <meta name="ICBM" content="3.26289, -76.5384" />


      {/* SEO para redes sociales */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={restaurant.logo} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />

      {/* Favicon */}
      <link rel="icon" type="image/png" href={favicon} />
    </Helmet>
  );
}