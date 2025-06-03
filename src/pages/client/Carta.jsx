import CartaLayout from "../../components/CartaLayout";
import { useRestaurant } from "../../contexts/RestaurantContext";

import theme from "../../theme";

function Carta() {
    const { restaurant } = useRestaurant();
    return (
        <CartaLayout>
            <div className={`${theme.layout.darkBackground} min-h-screen flex items-center justify-center`}>
                {/* Aquí va la carta real */}
                <div className="space-y-4">
                    <h1 className="text-2xl font-bold">Carta de {restaurant.name}</h1>
                    <p>Listado de productos...</p>
                </div>
            </div>
        </CartaLayout>
    )
}

export default Carta
