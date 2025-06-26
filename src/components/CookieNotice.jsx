import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function CookieNotice({
    consent = true,
    message = "Usamos cookies para mejorar tu experiencia. ¿Aceptas el uso de cookies?",
    buttonLabelAccept = "Aceptar",
    buttonLabelDecline = "Rechazar",
    position = "bottom", // "top" o "bottom"
    customMargin = "",
    localStorageKey = "cookie-consent",
    autoMinimizeDelay = 5000, // milisegundos
    minimizedPosition = "right",
}) {
    const CONSENT_MESSAGE = "Usamos cookies para mejorar tu experiencia. ¿Aceptas el uso de cookies?";
    const NOCONSENT_MESSAGE = "Usamos cookies esenciales para el funcionamiento del sitio. No se utilizan cookies de seguimiento o publicidad.";

    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [minimized, setMinimized] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(localStorageKey);

        const shouldShow =
            !stored ||
            (stored === "dismissed" && consent) ||
            ((stored === "accepted" || stored === "declined") && !consent);

        if (shouldShow) {
            setMounted(true);
            setTimeout(() => setVisible(true), 10);

            // Iniciar minimización automática
            setTimeout(() => setMinimized(true), autoMinimizeDelay);
        }
    }, [consent, localStorageKey, autoMinimizeDelay]);

    const handleClose = (action) => {
        if (action) localStorage.setItem(localStorageKey, action);
        setVisible(false);
        setTimeout(() => setMounted(false), 300);
    };

    const handleRestore = () => {
        setMinimized(false);
        // reinicia el temporizador si deseas que vuelva a minimizarse
        setTimeout(() => setMinimized(true), autoMinimizeDelay);
    };

    if (!mounted) return null;

    const basePosition =
        position === "top"
            ? "top-4 sm:top-8"
            : "bottom-4 sm:bottom-8";

    return (
        <div
            className={`fixed z-50 transition-all duration-300 transform
                ${customMargin} ${visible ? "opacity-100" : "opacity-0"}
                ${minimized
                    ? `${position === "top" ? "top-2" : "bottom-2"} ${minimizedPosition === "right" ? "right-2 sm:right-4" : "left-2 sm:left-4"} w-fit`
                    : `left-4 right-4 sm:left-8 sm:right-8 ${basePosition}`}
            `}
        >
            <div
                className={`bg-white border shadow-lg p-3 flex items-center gap-4
                    ${minimized ? "rounded-full cursor-pointer hover:shadow-xl" : "rounded-2xl flex-col sm:flex-row justify-between"}
                `}
                onClick={minimized ? handleRestore : undefined}
            >
                <div className="text-sm text-gray-800">
                    {minimized ? "🍪" :
                        message !== CONSENT_MESSAGE
                            ? message
                            : consent
                                ? CONSENT_MESSAGE
                                : NOCONSENT_MESSAGE}
                </div>

                {!minimized && (
                    <div className="flex gap-2 items-center">
                        {consent ? (
                            <>
                                <button
                                    onClick={() => handleClose("accepted")}
                                    className="px-3 py-1 text-sm bg-black text-white rounded-md"
                                >
                                    {buttonLabelAccept}
                                </button>
                                <button
                                    onClick={() => handleClose("declined")}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                                >
                                    {buttonLabelDecline}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => handleClose("dismissed")}
                                className="text-gray-500 hover:text-gray-700"
                                aria-label="Cerrar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}