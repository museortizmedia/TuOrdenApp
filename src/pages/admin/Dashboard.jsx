import { useAuth } from "../../contexts/AuthContext";
import theme from "../../theme";

function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className={`${theme.layout.darkBackground} min-h-screen flex items-center justify-center`}>
      <h1 className="text-2xl font-bold mb-2">Bienvenido, {user.email}</h1>
      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
export default Dashboard