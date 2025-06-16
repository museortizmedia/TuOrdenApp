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
                "url": "https://www.monstersburger.com.co",
                "inLanguage": "es-CO",
                "potentialAction": [{
                  "@type": "ViewAction",
                  "target": "https://www.monstersburger.com.co/carta",
                  "name": "Ver el menú"
                },
                {
                  "@type": "CommunicateAction",
                  "target": "https://wa.me/573243590591?text=¡Hola!%20Quiero%20hacer%20una%20reserva",
                  "name": "Reservar por WhatsApp"
                }],

                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": "https://www.monstersburger.com.co"
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
                "name": "Monsters Burger",
                "url": "https://www.monstersburger.com.co",
                "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGF636aFKyKV_2Kq4oxwaCGYb0EK50VwOOXQ&s",
                "telephone": "+573243590591",
                "menu": "https://www.monstersburger.com.co/carta",
                "priceRange": "$$",
                "servesCuisine": [
                  "Comida rápida",
                  "Hamburguesas",
                  "Alitas",
                  "Perros",
                  "Asados",
                  "Cocteles",
                  "Domicilios"
                ],
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Cra. 4 #12-42",
                  "addressLocality": "Jamundí",
                  "addressRegion": "Valle del Cauca",
                  "postalCode": "763561",
                  "addressCountry": "CO"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 3.26289,
                  "longitude": -76.5384
                },
                "openingHoursSpecification": [
                  {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday"
                    ],
                    "opens": "17:00",
                    "closes": "23:00"
                  },
                  {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": [
                      "Friday",
                      "Saturday",
                      "Sunday"
                    ],
                    "opens": "17:00",
                    "closes": "00:00"
                  }
                ],
                "review": {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": 4.4,
                    "bestRating": 5
                  },
                  "author": {
                    "@type": "Organization",
                    "name": "Clientes Monsters Burger"
                  }
                },
                "sameAs": [
                  "https://www.instagram.com/monstersburgers/",
                  "https://www.facebook.com/MontersBurgers/"
                ],
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": "https://www.monstersburger.com.co/carta"
                }
              }
            )
          )
        }
      </script>
    </Helmet>
  );
}