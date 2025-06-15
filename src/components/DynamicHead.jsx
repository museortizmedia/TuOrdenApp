import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useRestaurant } from "../contexts/RestaurantContext";

const seoConfig = {
  "monstersburger.com.co": {
    title: "Monsters Burger Jamundí | Comida rápida a domicilio",
    description:
      "Disfruta de las mejores hamburguesas, alitas, asados en Monsters Burger Jamundí. Ordena en línea y recibe en casa.",
    canonical: "https://monstersburger.com.co/",
    image:
      "https://lh3.googleusercontent.com/p/AF1QipMoRH3IbdN0L33W7rws7CDHhYfHvQmS74w9F6pG=s680-w680-h510-rw",
    geo: {
      region: "CO",
      placename: "Jamundí",
      position: "3.26289;-76.5384",
    },
  },
  // otros dominios...
};

export default function DynamicHead() {
  const location = useLocation();
  const { restaurant } = useRestaurant();

  const rawHost = window.location.hostname;
  const host = rawHost.replace(/^www\./, "");
  const config = seoConfig[host];

  const pathname = location.pathname;
  const isAdmin = pathname === "/admin";
  const isCarta = pathname === "/carta";

  // Fallbacks mínimos
  const fallbackTitle = `Bienvenido a ${host}`;
  const fallbackDescription = `Explora el sitio web de ${host}. Descubre nuestros servicios y productos.`;
  const fallbackCanonical = `https://${rawHost}${pathname}`;

  const title = config
    ? isAdmin
      ? `${config.title} | Admin`
      : isCarta
        ? `${config.title} | Carta | Menú`
        : config.title
    : fallbackTitle;

  const description = config
    ? isAdmin
      ? `Panel administrativo de ${restaurant.name || host}. ${config.description}`
      : isCarta
        ? `Consulta la carta de ${restaurant.name || host}. ${config.description} menu menú`
        : config.description
    : fallbackDescription;

  const canonical = config
    ? `${config.canonical.replace(/\/$/, "")}${pathname}`
    : fallbackCanonical;

  const image = config?.image || undefined;
  const shouldIndex = !isAdmin;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={shouldIndex ? "index, follow" : "noindex, nofollow"} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* SEO Local opcional */}
      {config?.geo && (
        <>
          <meta name="geo.region" content={config.geo.region} />
          <meta name="geo.placename" content={config.geo.placename} />
          <meta name="geo.position" content={config.geo.position} />
          <meta name="ICBM" content={config.geo.position} />
        </>
      )}

      {/* PRELOAD */}
      {restaurant.logo && (
        <link
          rel="preload"
          as="image"
          href={restaurant.logo}
        />
      )}

      <script type="application/ld+json">
        {isCarta ?
          (
            JSON.stringify(
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Monsters Burger",
                "url": "https://monstersburger.com.co",
                "inLanguage": "es-CO",
                "potentialAction": [
                  {
                    "@type": "ViewAction",
                    "target": "https://monstersburger.com.co/carta",
                    "name": "Ver el menú"
                  },
                  {
                    "@type": "ContactAction",
                    "target": "https://wa.me/573243590591?text=%C2%A1Hola!%20Quiero%20hacer%20una%20reserva",
                    "name": "Chatear por WhatsApp Reservar Monsters Burger"
                  }
                ],

                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": "https://monstersburger.com.co"
                }
              }
            )
          )
          :
          (
            JSON.stringify(
              {
                "@context": "https://schema.org",
                "@type": "Restaurant",
                "@id": "https://monstersburger.com.co#restaurant",
                "name": "Monsters Burger",
                "url": "https://monstersburger.com.co",
                "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGF636aFKyKV_2Kq4oxwaCGYb0EK50VwOOXQ&s",
                "telephone": "+57-324-3590591",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Jamundí",
                  "addressRegion": "Valle del Cauca",
                  "addressCountry": "CO"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 3.26289,
                  "longitude": -76.5384
                },
                "location": {
                  "@type": "Place",
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 3.26289,
                    "longitude": -76.5384
                  },
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Jamundí",
                    "addressRegion": "Valle del Cauca",
                    "addressCountry": "CO"
                  }
                },
                "priceRange": "$$",
                "servesCuisine": ["Comida rápida", "Hamburguesas", "Alitas", "Perros", "Asados", "Cocteles", "Domicilios"],
                "sameAs": [
                  "https://www.instagram.com/monstersburgers/",
                  "https://www.facebook.com/MontersBurgers/"
                ],
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": "https://monstersburger.com.co/carta"
                }
              }

            )
          )
        }
      </script>
    </Helmet>
  );
}