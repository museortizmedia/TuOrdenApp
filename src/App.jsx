import React, { useEffect, useState } from "react";
import domains from "./domains.json";
import Index from "./pages/Index";
import firestoreService from "./servicies/firestoreService"
import theme from "./theme";

function App() {
  // Definicion del restaurante por dominios
  const id = domains[window.location.host.includes("localhost") ? "default" : window.location.host.toLowerCase()];

  // Loading control state
  const [isLoading, setIsLoading] = useState(true);

  // Find restaurant data
  const [restaurantinfo, setRestaurantinfo] = useState({
    logo: "https://images.rappi.com/restaurants_logo/22-1715892877747.png",
    botons: []
  });

  // First useEffect
  useEffect(() => {
    const fetchData = async () => {
      const restaurant = await firestoreService.findById("restaurants", id);
      console.log(restaurant)

      //const restauranteExpandido = await firestoreService.deepResolveReferences(restaurant, 2);
      //console.log(restauranteExpandido)

      // Crear botones solo cuando ya tenemos los datos
      const botons = [
        {
          text: "Reservar",
          onClick: () => { if (restaurant.whatsapp) { window.open(restaurant.whatsapp, "_blank", "noopener,noreferrer"); } },
          style: "primary"
        },
        {
          text: "Ver Carta",
          onClick: () => console.log("Menú"),
          style: "secondary"
        }
      ];

      setRestaurantinfo({
        ...restaurant,
        logo: restaurant.logo,
        botons
      });

      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className={`${theme.layout.darkBackground} min-h-screen flex items-center justify-center`}>
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
console.log(JSON.stringify(restaurantinfo));
  return (
    <>
    <Index
      imageurl={restaurantinfo.logo}
      buttons={restaurantinfo.botons}
      title={restaurantinfo.name}
      subtitle={restaurantinfo.subtitle}
    />
    </>
  );
}

export default App;