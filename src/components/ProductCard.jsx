import React from "react";
import theme from "../theme";
import { useCart } from "../contexts/CartContext";
import { useRestaurant } from "../contexts/RestaurantContext";
import audioService from "../servicies/audio";

function ProductCard({ product, isFirstImage, compact = false }) {
  const { restaurant } = useRestaurant();
  const { addToCart } = useCart();

  const isAvailable = product.state === true && restaurant.estaAbierto;
  const isValidImage = product.image && product.image !== "/assets/defaultImage.jpg";
  const imageSrc = isValidImage ? product.image : "/assets/defaultImage.jpg";

  const handleProductCart = () => {
    audioService.play("manualInteract");
    addToCart(product);
  };

  if (compact) {
    // 🔹 VERSIÓN COMPACTA - horizontal, baja altura
    return (
      <div
        key={product.id}
        className={`flex items-center bg-[#1a1a1a] rounded-xl shadow-sm w-full overflow-hidden px-3 py-2 transition
          ${isAvailable ? "hover:scale-[1.01]" : "opacity-60 grayscale cursor-not-allowed"}`}
        style={{ minHeight: "90px", maxHeight: "110px" }}
      >
        {/* Imagen */}
        <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover"
            loading={isFirstImage ? "eager" : "lazy"}
            fetchPriority={isFirstImage ? "high" : "auto"}
            decoding="async"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center ml-3 flex-grow overflow-hidden">
          <h3 className="text-white font-semibold text-sm truncate">{product.name}</h3>
          <p className="text-gray-400 text-xs leading-tight line-clamp-2">
            {product.desc}
          </p>
        </div>

        {/* Precio */}
        <div className="flex flex-col items-end justify-between ml-3 h-full py-1 text-center">
        <p className="text-yellow-400 font-bold text-sm">
            ${product.price.toLocaleString("es-CL")}
          </p>
        </div>

        {/* Botón */}
        <div className="flex flex-col items-end justify-between ml-3 h-full py-1">

          {isAvailable && (
            <button
              onClick={handleProductCart}
              className="bg-yellow-400 text-black text-sm font-bold px-2 py-1 rounded-md hover:bg-yellow-300"
              title="Agregar al carrito"
            >
              +
            </button>
          )}
        </div>
      </div>
    );
  }

  // 🔸 VERSIÓN NORMAL (ya definida)
  return (
    <div
      key={product.id}
      className={`flex flex-col lg:flex-row bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg mx-auto w-full min-w-[200px] max-w-[500px]
        ${isAvailable ? "hover:scale-[1.02] transition-transform" : restaurant.estaAbierto ? "opacity-60 grayscale cursor-not-allowed" : ""}`}
      title={product.name}
    >
      {/* Imagen */}
      <div className="relative w-full lg:w-1/4 xl:w-2/6" style={{ aspectRatio: "1 / 1" }}>
        <img
          src={imageSrc}
          alt={product.name}
          width={500}
          height={500}
          className="w-full h-full object-cover"
          loading={isFirstImage ? "eager" : "lazy"}
          fetchPriority={isFirstImage ? "high" : "auto"}
          decoding="async"
        />
        {(!isAvailable && restaurant.estaAbierto) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-extrabold text-xl bg-red-600 px-4 py-2 rounded-xl">
              AGOTADO
            </span>
          </div>
        )}
      </div>

      {/* Descripción */}
      <div className={`p-5 flex flex-col justify-between w-full gap-3 ${isAvailable ? "lg:w-2/4 xl:w-2/6" : "lg:w-3/4 xl:w-4/6"}`}>
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