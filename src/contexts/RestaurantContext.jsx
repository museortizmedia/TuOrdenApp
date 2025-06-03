import { createContext, useContext } from "react";

export const RestaurantContext = createContext();

export const RestaurantProvider = ({ value, children }) => (
  <RestaurantContext.Provider value={value}>
    {children}
  </RestaurantContext.Provider>
);

export const useRestaurant = () => useContext(RestaurantContext);