import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

const NotificationToggle = () => {
  const [hasPermission, setHasPermission] = useState(Notification.permission === "granted");

  useEffect(() => {
    // Escuchar cambios de permisos (en caso de que el usuario cambie en la configuración del navegador)
    const checkPermission = () => setHasPermission(Notification.permission === "granted");
    document.addEventListener("visibilitychange", checkPermission);
    return () => document.removeEventListener("visibilitychange", checkPermission);
  }, []);

  const requestPermission = () => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setHasPermission(true);
          new Notification("👌 Notificaciones activadas");
        }
      });
    }
  };

  return (
    <button
      onClick={requestPermission}
      className="p-2 bg-gray-800 text-white rounded-full shadow hover:bg-gray-700 transition hover:cursor-pointer"
      title={hasPermission ? "Notificaciones activadas" : "Activar notificaciones"}
    >
      {hasPermission ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
    </button>
  );
};

export default NotificationToggle;