import React, { useEffect, useState, useMemo, useRef } from "react";
import RestaurantLayout from "../../components/RestaurantLayout";
import { useRestaurant } from "../../contexts/RestaurantContext";
import theme from "../../theme";
import firestoreService from "../../servicies/firestoreService";
import { useCart } from "../../contexts/CartContext";

function Carta() {
    const { restaurant } = useRestaurant();
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);

    // Obtenemos los productos desde Firestore
    useEffect(() => {
        if (restaurant?.id) {
            firestoreService
                .findAll(`restaurants/${restaurant.id}/productos`)
                .then(setProducts);
        }
    }, [restaurant]);

    // Agrupar productos por categoría:
    // Se asume que el id de cada producto tiene la forma [categoria][numero de producto],
    // donde los últimos 3 caracteres corresponden al número.
    const groupedProducts = useMemo(() => {
        const groups = {};
        products.forEach((prod) => {
            // Extraer la categoría: suponemos que es la parte del id antes de los 3 últimos caracteres
            const prodId = prod.id;
            const category = prodId.slice(0, prodId.length - 3);
            if (!groups[category]) groups[category] = [];
            groups[category].push(prod);
        });
        // Ordenamos cada grupo según el número (los últimos 3 dígitos numéricos)
        Object.keys(groups).forEach((cat) => {
            groups[cat].sort((a, b) => {
                return Number(a.id.slice(-3)) - Number(b.id.slice(-3));
            });
        });
        return groups;
    }, [products]);

    // Obtenemos la lista de categorías
    const categories = useMemo(() => Object.keys(groupedProducts), [groupedProducts]);

    // Referencias para cada sección
    const sectionRefs = useRef({});

    // Detecta version mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Actualizar la categoría activa utilizando Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveCategory(entry.target.id);
                    }
                });
            },
            // Se ajusta para determinar cuándo consideramos la sección visible
            isMobile
                ? { rootMargin: "-50% 0px -30% 0px", threshold: 0.05 } // Para mobile
                : { rootMargin: "-30% 0px -60% 0px", threshold: 0.1 } // Para pc
        );
        categories.forEach((cat) => {
            if (sectionRefs.current[cat]) {
                observer.observe(sectionRefs.current[cat]);
            }
        });
        return () => observer.disconnect();
    }, [categories]);

    // Scroll suave al hacer clic en una categoría del menú
    const handleCategoryClick = (cat) => {
        const el = sectionRefs.current[cat];
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveCategory(cat);
        }
    };

    // AutoMove menu
    const buttonRefs = useRef({});
    useEffect(() => {
        if (activeCategory && buttonRefs.current[activeCategory]) {
            const el = buttonRefs.current[activeCategory];
            el.scrollIntoView({
                behavior: "smooth",
                inline: isMobile ? "nearest" : "center",
                block: "nearest",
            });
        }
    }, [activeCategory]);


    // Cart
    const { addToCart } = useCart();
    const handleProductCart = (product) => {
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        addToCart(product);
    }


    return (
        <>
            {/* Menú de categorías fijo justo debajo del header */}
            <div className="sticky top-[4.8rem] z-50 shadow-md">
                <nav
                    className={`${theme.colors.background.dark} flex bottom-0 overflow-x-auto whitespace-nowrap p-2 space-x-2 touch-pan-x scrollbar-hide-sm sm:scrollbar-hide border-b border-neutral-800 w-full max-w-full`}
                >
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            ref={(el) => (buttonRefs.current[cat] = el)}
                            onClick={() => handleCategoryClick(cat)}
                            className={`pb-1 px-3 text-sm transition-colors shrink-0 ${activeCategory === cat
                                ? "border-b-4 border-yellow-400 text-yellow-400 font-bold"
                                : "text-white hover:text-yellow-300 cursor-pointer hover:animate-pulse"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Header y boton de carrito envolvente */}
            <RestaurantLayout>
                <>
                    <div className={`${theme.layout.darkBackground} min-h-screen`}>
                        {/* Listado de productos por categoría */}
                        <div className="p-4 space-y-8">
                            {categories.map((cat) => (
                                <section
                                    key={cat}
                                    id={cat}
                                    ref={(el) => (sectionRefs.current[cat] = el)}
                                    className="scroll-mt-28 md:scroll-mt-32"
                                >
                                    <h2 className={`text-4xl ${theme.text.yellow} font-bold mt-20 mb-10`}>{cat}</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-10">
                                        {groupedProducts[cat].map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex flex-col md:flex-row bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02]"
                                            >
                                                {/* Imagen del producto */}
                                                <div className="w-full md:w-1/4 aspect-square overflow-hidden">
                                                    <img
                                                        src={product.image || "https://placehold.co/300"}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Contenido principal */}
                                                <div className="p-5 flex flex-col justify-between w-full md:w-2/4 gap-3">
                                                    <div>
                                                        <h3 className="text-xl font-extrabold text-white truncate">{product.name}</h3>
                                                        <p className="text-sm text-gray-300 line-clamp-3">{product.desc}</p>
                                                    </div>
                                                    <p className={`text-lg font-bold ${theme.text.yellow}`}>
                                                        ${(product.price).toLocaleString("es-CL")}
                                                    </p>
                                                </div>

                                                {/* Acción: botón o "Agotado" */}
                                                <div className="flex items-center justify-center w-full md:w-1/4 p-5">
                                                    {product.state === true ? (
                                                        <button
                                                            className={`w-full ${theme.buttons.secondary}  cursor-pointer text-white font-bold py-2 px-4 rounded-xl transition duration-300`}
                                                            onClick={() => handleProductCart(product)}
                                                        >
                                                            Añadir al carrito
                                                        </button>
                                                    ) : (
                                                        <span className={`bg-[#9d100f] truncate cursor-not-allowed text-white font-extrabold px-4 py-2 rounded-xl w-full text-center`}>
                                                            AGOTADO
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                        ))}
                                    </div>

                                </section>

                            ))}
                        </div>
                        <div className="p-4 space-y-8 pb-40"></div>
                    </div>
                </>
            </RestaurantLayout>
        </>
    );
}

export default Carta;