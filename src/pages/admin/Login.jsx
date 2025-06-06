import React, { useEffect, useState } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebase";
import theme from "../../theme";
// Providers
import { useRestaurant } from "../../contexts/RestaurantContext";

function Login({ error: externalError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(externalError || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { restaurant } = useRestaurant();

  useEffect(() => {
    if (externalError) {
      setError(externalError); // sincroniza si cambia desde AdminRoute
    }
  }, [externalError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err) {
      setError("Credenciales incorrectas");
      console.error(err);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
    setLoading(false);
  };

  return (
    <div className={`${theme.layout.darkBackground} min-h-screen flex items-center justify-center`}>
      <form
        onSubmit={handleLogin}
        className={`${theme.colors.background.darkMedium} p-6 rounded-xl w-full max-w-sm shadow-lg`}
      >
        <div className="mb-4">
          <h2 className="text-xl text-white font-bold text-center">Acceso Administrativo</h2>
          <h3 className="text-xl text-white font-bold text-center">{restaurant.name}</h3>
        </div>

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${theme.colors.background.darkLight} w-full p-2 mb-3 rounded text-white border border-gray-700`}
          required
          autoComplete="username"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${theme.colors.background.darkLight} w-full p-2 mb-3 rounded text-white border border-gray-700`}
          required
          autoComplete="current-password"
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