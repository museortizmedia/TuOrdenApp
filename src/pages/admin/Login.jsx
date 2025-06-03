// src/pages/Login.jsx
import { useState } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import theme from "../../theme";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin"); // redirige al dashboard si login OK
    } catch (err) {
      setError("Credenciales incorrectas");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className={`${theme.layout.darkBackground} min-h-screen flex items-center justify-center`}>
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-6 rounded-xl w-full max-w-sm shadow-lg"
      >
        <h2 className="text-xl text-white font-bold mb-4 text-center">Acceso Administrativo</h2>

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white border border-gray-700"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-700"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`${theme.buttons.primary} w-full`}
        >
          {loading ? "Entrando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
}

export default Login;