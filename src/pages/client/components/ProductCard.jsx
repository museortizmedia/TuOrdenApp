import React from "react";
import theme from "../../../theme";
import { useCart } from "../../../contexts/CartContext";

function ProductCard({ product, isFirstImage }) {
    const { addToCart } = useCart();
    const isAvailable = product.state === true;
    const isValidImage = product.image && product.image !== "/assets/defaultImage.jpg";
    const imageSrc = isValidImage ? product.image : "/assets/defaultImage.jpg";

    const handleProductCart = () => {
        if (navigator.vibrate) navigator.vibrate(100);
        addToCart(product);
    };

    return (
        <div
            key={product.id}
            className={`flex flex-col lg:flex-row bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg mx-auto w-full min-w-[200px] max-w-[500px] ${
                isAvailable ? "hover:scale-[1.02] transition-transform" : "opacity-60 grayscale cursor-not-allowed"
            }`}
            title={product.name}
        >
            {/* Imagen con tamaño reservado */}
            <div className="relative w-full lg:w-1/4 xl:w-2/6" style={{ aspectRatio: "1 / 1" }}>
                <img
                    src={imageSrc}
                    alt={product.name}
                    width={500} // Tamaño máximo estimado
                    height={500}
                    className="w-full h-full object-cover"
                    loading={isFirstImage ? "eager" : "lazy"}
                    fetchPriority={isFirstImage ? "high" : "auto"}
                    decoding="async"
                />
                {!isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-extrabold text-xl bg-red-600 px-4 py-2 rounded-xl">
                            AGOTADO
                        </span>
                    </div>
                )}
            </div>

            {/* Descripción */}
            <div
                className={`p-5 flex flex-col justify-between w-full gap-3 ${
                    isAvailable ? "lg:w-2/4 xl:w-2/6" : "lg:w-3/4 xl:w-4/6"
                }`}
            >
                <div>
                    <h3 className="text-xl font-extrabold text-white line-clamp-3 truncate lg:overflow-visible lg:whitespace-normal lg:text-clip">
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-300 line-clamp-3 overflow-y-auto">{product.desc}</p>
                </div>
                <p className={`text-xl font-extrabold ${theme.text.yellow}`}>
                    ${product.price.toLocaleString("es-CL")}
                </p>
            </div>

            {/* Botón */}
            {isAvailable && (
                <div className="flex items-center justify-center w-full lg:w-1/4 xl:w-2/6 p-5">
                    <button
                        className={`w-full ${theme.buttons.secondary} hover:text-[#003366] cursor-pointer font-bold py-2 px-4 rounded-xl transition duration-300 xl:text-xl`}
                        onClick={handleProductCart}
                    >
                        Añadir al carrito
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProductCard;