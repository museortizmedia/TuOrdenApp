import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRestaurant } from "../../contexts/RestaurantContext";
import firestoreService from "../../servicies/firestoreService";
import theme from "../../theme";
import { LogOutIcon, Menu, X, ClipboardList, ShoppingBag, Layers, CalendarClock, Settings } from "lucide-react";
import AdminProducts from "./pages/AdminProducts";
import AdminOrdenes from "./pages/AdminOrdenes";
import AdminStory from "./pages/AdminStory";
import AdminCategoryOrden from "./pages/AdminCategoryOrden.jsx";
import supabaseService from "../../servicies/supabaseService.js"
import ToggleNotification from "../../components/ToggleNotification.jsx";
import ToggleSound from "../../components/ToggleSound.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";

function Dashboard() {
  const { user, logout } = useAuth();
  const { restaurant } = useRestaurant();
  const [userBD, setUserBD] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("Órdenes");

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

  // Obtener usuarrio de supabase
  const [supabaseUser, setSupabaseUser] = useState(null);

  useEffect(() => {
    const fetchSupabaseUser = async () => {
      const user = await supabaseService.getCurrentUser();
      setSupabaseUser(user);
    };
    fetchSupabaseUser();
  }, []);

  const subPages = [
    { logo: ClipboardList, name: "Órdenes", content: <AdminOrdenes /> },
    { logo: ShoppingBag, name: "Productos", content: <AdminProducts /> },
    { logo: Layers, name: "Orden Carta", content: <AdminCategoryOrden /> },
    { logo: CalendarClock, name: "Historial", content: <AdminStory /> },
    { logo: Settings, name: "Ajustes", content: <AdminSettings /> },
  ];

  const currentPage = subPages.find((p) => p.name === activePage);

  const [showSessionInfo, setShowSessionInfo] = useState(false);

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
          <button onClick={logout} className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded cursor-pointer flex">
            Salir
            <LogOutIcon className="w-4 h-4 ml-2"/>
          </button>

          <ToggleNotification/>

          <ToggleSound/>

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
                className={`text-left px-3 py-2 rounded hover:bg-neutral-700 flex transition ${activePage === page.name ? "bg-neutral-700 font-bold cursor-auto" : "cursor-pointer"
                  }`}
              >
                <page.logo className="mr-2"/>
                {page.name}
              </button>
            ))}

            {/* Toggle de información de sesión */}
            <div className="border-t-1 border-t-white/50">
              <button
                onClick={() => setShowSessionInfo(prev => !prev)}
                className="text-xs text-white/50 font-medium underline cursor-pointer"
              >
                {showSessionInfo ? "Ocultar información de servicios" : "Ver información de servicios"}
              </button>

              {showSessionInfo && (
                <div className="mt-3 rounded-lg bg-neutral-900 border border-neutral-700 p-4 text-sm text-white shadow-md space-y-4">
                  <p className="text-sm font-semibold ">Estado de servicios</p>

                  {/* Firebase */}
                  <div className="flex flex-col gap-1 border border-neutral-800 p-3 rounded-md bg-neutral-800">
                    <div className="flex justify-between items-center">
                      <p className={`font-medium ${user ? "text-green-400" : "text-red-400"}`}>
                        Base de datos (documentos - FB): {user ? "✔️ Activa" : "❌ Inactiva"}
                      </p>
                      <button
                        onClick={async () => {
                          await logout();
                          setUserBD(null);
                        }}
                        className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md cursor-pointer"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                    {user?.email && (
                      <p className="text-xs text-neutral-400">Email: {user.email}</p>
                    )}
                  </div>

                  {/* Supabase */}
                  <div className="flex flex-col gap-1 border border-neutral-800 p-3 rounded-md bg-neutral-800">
                    <div className="flex justify-between items-center">
                      <p className={`font-medium ${supabaseUser ? "text-green-400" : "text-red-400"}`}>
                        Base de datos (storage - SB): {supabaseUser ? "✔️ Activa" : "❌ Inactiva"}
                      </p>
                      <button
                        onClick={async () => {
                          if (supabaseUser === null && userBD != null) {
                            // iniciar sesion
                            await supabaseService.login(userBD.email, userBD.psw);
                            const newUser = await supabaseService.getCurrentUser();
                            setSupabaseUser(newUser);
                          } else {
                            await supabaseService.logout();
                            setSupabaseUser(null);
                          }
                        }}
                        className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md cursor-pointer"
                      >
                        {supabaseUser === null ? "Iniciar Sesión" : "Cerrar sesión"}
                      </button>
                    </div>
                    {supabaseUser?.email && (
                      <p className="text-xs text-neutral-400">Email: {supabaseUser.email}</p>
                    )}
                  </div>
                </div>
              )}
            </div>



          </nav>




        </aside>

        {/* Contenido de subpágina */}
        <main className="flex-1 p-6">{currentPage?.content || "..."}</main>
      </div>
    </div>
  );
}

export default Dashboard;