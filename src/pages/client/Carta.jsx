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

    useEffect(() => {
        if (restaurant?.id) {
            firestoreService
                .findAll(`restaurants/${restaurant.id}/productos`)
                .then(setProducts);
        }
    }, [restaurant]);

    const groupedProducts = useMemo(() => {
        const groups = {};
        products.forEach((prod) => {
            const prodId = prod.id;
            const category = prodId.slice(0, prodId.length - 3);
            if (!groups[category]) groups[category] = [];
            groups[category].push(prod);
        });
        Object.keys(groups).forEach((cat) => {
            groups[cat].sort((a, b) => Number(a.id.slice(-3)) - Number(b.id.slice(-3)));
        });
        return groups;
    }, [products]);

    const categories = useMemo(() => Object.keys(groupedProducts), [groupedProducts]);

    const sectionRefs = useRef({});

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveCategory(entry.target.id);
                    }
                });
            },
            isMobile
                ? { rootMargin: "-50% 0px -30% 0px", threshold: 0.05 }
                : { rootMargin: "-30% 0px -60% 0px", threshold: 0.1 }
        );
        categories.forEach((cat) => {
            if (sectionRefs.current[cat]) {
                observer.observe(sectionRefs.current[cat]);
            }
        });
        return () => observer.disconnect();
    }, [categories]);

    const handleCategoryClick = (cat) => {
        const el = sectionRefs.current[cat];
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveCategory(cat);
        }
    };

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

    const { addToCart } = useCart();
    const handleProductCart = (product) => {
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        addToCart(product);
    };

    return (
        <>
            <div className="sticky top-[4.8rem] z-50 shadow-md">
                <nav className={`${theme.colors.background.dark} flex bottom-0 overflow-x-auto whitespace-nowrap p-2 space-x-2 touch-pan-x scrollbar-hide-sm sm:scrollbar-hide border-b border-neutral-800 w-full max-w-full`}>
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

            <RestaurantLayout>
                <div className={`${theme.layout.darkBackground} min-h-screen`}>
                    <div className="p-4 space-y-8">
                        {categories.map((cat) => (
                            <section
                                key={cat}
                                id={cat}
                                ref={(el) => (sectionRefs.current[cat] = el)}
                                className="scroll-mt-28 md:scroll-mt-32"
                            >
                                <h2 className={`text-4xl ${theme.text.yellow} font-bold mt-20 mb-10`}>{cat}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 xl:gap-10">
                                    {groupedProducts[cat].map((product) => {
                                        const isAvailable = product.state === true;

                                        return (
                                            <div
                                                key={product.id}
                                                className={`flex flex-col lg:flex-row bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg mx-auto w-full min-w-[200px] max-w-[500px] ${isAvailable ? "hover:scale-[1.02] transition-transform" : "opacity-60 grayscale cursor-not-allowed"}`}
                                                title={product.name}
                                            >
                                                {/* Imagen */}
                                                <div className="relative aspect-square overflow-hidden w-full lg:w-1/4 xl:w-2/6">
                                                    <img
                                                        src={product.image || "/assets/defaultImage.jpg"}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {!isAvailable && (
                                                        <div className="absolute inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center">
                                                            <span className="text-white font-extrabold text-xl bg-red-600 px-4 py-2 rounded-xl">
                                                                AGOTADO
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Descripción */}
                                                <div className={`p-5 flex flex-col justify-between w-full gap-3 ${isAvailable? "lg:w-2/4 xl:w-2/6" : "lg:w-3/4 xl:w-4/6"}`}>
                                                    <div>
                                                        <h3 className="text-xl font-extrabold text-white line-clamp-3 truncate lg:overflow-visible lg:whitespace-normal lg:text-clip">{product.name}</h3>
                                                        <p className="text-sm text-gray-300 line-clamp-3 overflow-y-auto">{product.desc}</p>
                                                    </div>
                                                    <p className={`text-xl font-extrabold ${theme.text.yellow}`}>
                                                        ${(product.price).toLocaleString("es-CL")}
                                                    </p>
                                                </div>

                                                {/* Acción */}
                                                {isAvailable && (
                                                <div className="flex items-center justify-center w-full lg:w-1/4 xl:w-2/6 p-5">
                                                    
                                                        <button
                                                            className={`w-full ${theme.buttons.secondary} hover:text-[#003366] cursor-pointer font-bold py-2 px-4 rounded-xl transition duration-300 xl:text-2xl`}
                                                            onClick={() => handleProductCart(product)}
                                                        >
                                                            Añadir al carrito
                                                        </button>
                                                    
                                                </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </RestaurantLayout>
        </>
    );
}

export default Carta;