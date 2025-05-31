import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useState } from "react";

export default function TestAuth() {
  const [message, setMessage] = useState("");

  const login = async () => {
    try {
      const email = "museortiz@gmail.com";     // Un usuario válido en tu Auth
      const password = "123456";            // Su contraseña
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("✅ Login exitoso");
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={login}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Probar Login
      </button>
      <p className="mt-4">{message}</p>
    </div>
  );
}
