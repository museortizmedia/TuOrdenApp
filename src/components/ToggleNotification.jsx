import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

const ToggleNotification = () => {
  const [hasPermission, setHasPermission] = useState(Notification.permission === "granted");
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem("notificationsEnabled") !== "false";
  });

  useEffect(() => {
    const checkPermission = () => setHasPermission(Notification.permission === "granted");
    document.addEventListener("visibilitychange", checkPermission);
    return () => document.removeEventListener("visibilitychange", checkPermission);
  }, []);

  const toggleNotifications = () => {
    if (!hasPermission) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setHasPermission(true);
          setNotificationsEnabled(true);
          localStorage.setItem("notificationsEnabled", "true");
          new Notification("👌 Notificaciones activadas");
        }
      });
    } else {
      const newState = !notificationsEnabled;
      setNotificationsEnabled(newState);
      localStorage.setItem("notificationsEnabled", newState.toString());
    }
  };

  return (
    <button
      onClick={toggleNotifications}
      className="p-2 bg-gray-800 text-white rounded-full shadow hover:bg-gray-700 transition-transform duration-200 active:scale-105 hover:scale-105 cursor-pointer"
      title={
        hasPermission
          ? notificationsEnabled
            ? "Silenciar"
            : "Activar Notificaciones"
          : "Activar notificaciones"
      }
    >
      {hasPermission && notificationsEnabled ? (
        <Bell className="w-5 h-5" />
      ) : (
        <BellOff className="w-5 h-5" />
      )}
    </button>
  );
};

export default ToggleNotification;
