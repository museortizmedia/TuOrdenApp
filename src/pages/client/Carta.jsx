// React import
import React, { useEffect, useState, useMemo, useRef, Suspense, lazy } from "react";
// Contexts
import { useRestaurant } from "../../contexts/RestaurantContext";
// Services
import firestoreService from "../../servicies/firestoreService";
// Styles
import theme from "../../theme";
// Components
import RestaurantLayout from "../../components/RestaurantLayout";

// Componentes de carga diferida
const ProductCard = lazy(() => import("./components/ProductCard.jsx"));

function Carta() {
    const { restaurant } = useRestaurant(); // Contexto de informacion del restaurante
    const [products, setProducts] = useState([]); // Estado con todos los productos
    const [activeCategory, setActiveCategory] = useState(null); // Estado con la categoria visible
    const [visibleProductIds, setVisibleProductIds] = useState(new Set()); // IDs de productos visibles (cargas diferidas)

    // Una vez cargado el contexto de restaurante, cargaremos los prodcutos
    useEffect(() => {
        if (restaurant?.id) {
            firestoreService
                .findAll(`restaurants/${restaurant.id}/productos`)
                .then(setProducts);
        }
    }, [restaurant]);

    // Agrupar productos por categoría y ordenar
    const [categoryMap, groupedProducts] = useMemo(() => {
        const groups = {};
        const map = {};

        products.forEach((prod) => {
            const category = prod.id.slice(0, prod.id.length - 3);

            if (!groups[category]) groups[category] = [];
            groups[category].push(prod);

            if (prod.categoryOrder !== undefined) {
                if (map[category] === undefined || prod.categoryOrder < map[category]) {
                    map[category] = prod.categoryOrder;
                }
            }
        });

        // Ordena productos dentro de cada categoría
        Object.keys(groups).forEach((cat) => {
            groups[cat].sort((a, b) => Number(a.id.slice(-3)) - Number(b.id.slice(-3)));
        });

        return [map, groups];
    }, [products]);

    // Obtener las categorías ordenadas (segun su valor de orden)
    const categories = useMemo(() => {
        const keys = Object.keys(groupedProducts);
        return keys.sort((a, b) => (categoryMap[a] ?? 999) - (categoryMap[b] ?? 999));
    }, [groupedProducts, categoryMap]);

    const sectionRefs = useRef({}); // Referencias por categorias
    const productRefs = useRef({}); // Referencias por producto

    // Estado dinámico si la página está en versión movil
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isScrollingByClick = useRef(false); // Flag para saber si el scroll fue manual
    
    // Detectar qué categoría está visible para resaltar el botón (mientras sea scroll manual)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isScrollingByClick.current) {
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
    }, [categories, isMobile]);

    // Click en categoría: scroll suave + prevenir intersección temporal
    const handleCategoryClick = (cat) => {
        const el = sectionRefs.current[cat];
        if (el) {
            isScrollingByClick.current = true; // Flag activado

            el.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveCategory(cat); // Lo seteamos directamente

            // Apagamos el flag después de un tiempo razonable (~1s)
            setTimeout(() => {
                isScrollingByClick.current = false;
            }, 1000);
        }
    };

    // Referencias para botones de categoría
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

    // IntersectionObserver para productos individuales
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = entry.target.dataset.id;
                    if (entry.isIntersecting && id) {
                        setVisibleProductIds((prev) => new Set(prev).add(id));
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: "200px 0px", threshold: 0.1 }
        );

        Object.entries(productRefs.current).forEach(([id, el]) => {
            if (el && !visibleProductIds.has(id)) {
                observer.observe(el);
            }
        });

        return () => observer.disconnect();
    }, [products, visibleProductIds]);

    return (
        <>
            {/* Navegación por categorías */}
            <div className="sticky top-[4.8rem] z-50 shadow-md">
                <nav className={`${theme.colors.background.dark} flex overflow-x-auto whitespace-nowrap p-2 space-x-2 border-b border-neutral-800 w-full max-w-full`}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            ref={(el) => (buttonRefs.current[cat] = el)}
                            onClick={() => handleCategoryClick(cat)}
                            className={`pb-1 px-3 text-sm transition-colors shrink-0 ${activeCategory === cat
                                    ? "border-b-4 border-yellow-400 text-yellow-400 font-bold"
                                    : "text-white hover:text-yellow-300 cursor-pointer hover:font-bold hover:scale-105 duration-200 transition-transform"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Contenido principal */}
            <RestaurantLayout>
                <div className={`${theme.layout.darkBackground} [min-height:100dvh]`}>
                    <div className="p-4 space-y-8">
                        {categories.map((cat) => (
                            <section
                                key={cat}
                                id={cat}
                                ref={(el) => (sectionRefs.current[cat] = el)}
                                className="mt-28 scroll-mt-28 md:scroll-mt-32"
                            >
                                <h2 className={`text-2xl md:text-3xl lg:text-4xl font-black my-15 py-5 text-center w-screen relative left-1/2 -translate-x-1/2 bg-[#f6d926] text-[#111] hover:scale-105`}>{cat}</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 2xl:grid-cols-3 gap-20 sm:gap-8 md:gap-8 xl:gap-8">
                                    {groupedProducts[cat].map((product, idx) => {
                                        const isVisible = visibleProductIds.has(product.id);
                                        const isValidImage = product.image && product.image !== "/assets/defaultImage.jpg";
                                        const isFirstImage = idx === 0 && isValidImage;

                                        return (
                                            <div
                                                key={product.id}
                                                data-id={product.id}
                                                ref={(el) => (productRefs.current[product.id] = el)}
                                                className="px-10 sm:px-0"
                                            >
                                                {isVisible ? (
                                                    <Suspense fallback={<div className="h-[300px] bg-neutral-900 rounded-xl animate-pulse" />}>
                                                        <ProductCard
                                                            product={product}
                                                            isFirstImage={isFirstImage}
                                                        />
                                                    </Suspense>
                                                ) : (
                                                    <div className="h-[300px] bg-neutral-800 rounded-xl animate-pulse" />
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