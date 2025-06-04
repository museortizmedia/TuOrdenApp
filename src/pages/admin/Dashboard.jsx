import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRestaurant } from "../../contexts/RestaurantContext";
import firestoreService from "../../servicies/firestoreService";
import theme from "../../theme";
import { Menu, X } from "lucide-react";
import AdminProducts from "./pages/AdminProducts";

function Dashboard() {
  const { user, logout } = useAuth();
  const { restaurant } = useRestaurant();
  const [userBD, setUserBD] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("Inicio");

  const menuRef = useRef();

  // Detectar clic fuera para cerrar el menú
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Obtener usuario desde Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await firestoreService.findById("users", user.uid);
          if (userDoc) setUserBD(userDoc);
        } catch (err) {
          console.error("Error al obtener el usuario:", err);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const subPages = [
    { name: "Inicio", content: <p className="text-lg">Panel principal</p> },
    { name: "Productos", content: <AdminProducts/> },
    { name: "Categorías", content: <p>Gestión de categorías</p> },
  ];

  const currentPage = subPages.find((p) => p.name === activePage);

  return (
    <div className={`${theme.layout.darkBackground} min-h-screen text-white flex flex-col`}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 relative z-30">
        
         {/* Botón hamburguesa */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden ml-2"
            aria-label="Menú"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        {/* Logo + restaurante */}
        <div className="flex items-center gap-2">
          <img src={restaurant?.logo || "/logo.svg"} alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-lg">{restaurant?.name || "Mi Restaurante"}</span>
        </div>

        {/* Título central */}
        <div className="hidden md:block text-center text-xl font-semibold absolute left-1/2 transform -translate-x-1/2">
          {activePage}
        </div>

        {/* Usuario y logout */}
        <div className="flex items-center gap-3">
          <span className="text-sm hidden sm:inline">
            {userBD?.name ? `Hola, ${userBD.name}` : "Cargando..."}
          </span>
          <button onClick={logout} className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
            Cerrar sesión
          </button>

        </div>
      </header>

      {/* Layout principal */}
      <div className="flex flex-1">
        {/* Menú lateral con animación */}
        <aside
          ref={menuRef}
          className={`
            fixed top-16 left-0 h-full w-64 bg-[#1a1a1a] border-r border-neutral-800 p-4 
            transform transition-transform duration-300 ease-in-out z-20
            ${menuOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:block
          `}
        >
          <nav className="flex flex-col gap-3">
            {subPages.map((page) => (
              <button
                key={page.name}
                onClick={() => {
                  setActivePage(page.name);
                  setMenuOpen(false); // Cierra en móvil
                }}
                className={`text-left px-3 py-2 rounded hover:bg-neutral-700 transition ${
                  activePage === page.name ? "bg-neutral-700 font-bold" : ""
                }`}
              >
                {page.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido de subpágina */}
        <main className="flex-1 p-6">{currentPage?.content || "..."}</main>
      </div>
    </div>
  );
}

export default Dashboard;