import React, { useEffect, useState, useMemo, useRef } from "react";
import CartaLayout from "../../components/CartaLayout";
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
                inline: "center",
                block: "nearest",
            });
        }
    }, [activeCategory]);


    // Cart
    const { addToCart} = useCart();
    const handleProductCart = (product) =>
    {
        console.log("Comprando "+product.name)
        addToCart(product);
    }


    return (
        <CartaLayout>
            <>
            <div className={`${theme.layout.darkBackground} min-h-screen`}>
                {/* Menú de categorías fijo */}
                <div className="sticky top-16 z-40 shadow-md">
                    <nav className={`${theme.colors.background.dark} flex overflow-x-auto whitespace-nowrap p-2 space-x-2 scrollbar-hide touch-pan-x`}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                ref={(el) => (buttonRefs.current[cat] = el)}
                                onClick={() => handleCategoryClick(cat)}
                                className={`pb-1 px-3 text-sm transition-colors shrink-0
                    ${activeCategory === cat
                                        ? "border-b-2 border-yellow-400 text-yellow-400 font-bold"
                                        : "text-white hover:text-yellow-300"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </nav>
                </div>



                {/* Listado de productos por categoría */}
                <div className="p-4 space-y-8">
                    {categories.map((cat) => (
                        <section
                            key={cat}
                            id={cat}
                            ref={(el) => (sectionRefs.current[cat] = el)}
                            className="scroll-mt-[100px] md:scroll-mt-20"
                        >
                            <h2 className="text-xl font-bold mt-20 mb-10">{cat}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-10">
                                {groupedProducts[cat].map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex flex-col md:flex-row items-stretch bg-[#101010] rounded-lg overflow-hidden shadow-md"
                                    >
                                        {/* Imagen cuadrada */}
                                        <div className="w-full md:w-32 aspect-square overflow-hidden">
                                            <img
                                                src={product.image || "https://placehold.co/300"}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Información del producto */}
                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-lg">{product.name}</h3>
                                                <p className="text-sm">{product.desc}</p>
                                            </div>
                                            <p className="mt-2 font-semibold">${(product.price).toLocaleString('es-CL')}</p>
                                        </div>

                                        {/* Botones */}
                                        <div className="flex items-center p-4">
                                            {product.state == true ?
                                                <button
                                                    className="bg-yellow-400 hover:bg-yellow-500 cursor-pointer text-black font-bold px-3 py-1 rounded"
                                                    onClick={()=>handleProductCart(product)}
                                                >
                                                    Añadir
                                                </button>
                                                :
                                                <span className="bg-red-400 text-black font-bold px-3 py-1 rounded">
                                                    AGOTADO
                                                </span>
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                    ))}
                </div>
            </div>
            </>
        </CartaLayout>
    );
}

export default Carta;