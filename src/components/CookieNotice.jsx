import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function CookieNotice({
    consent = true,
    message = "Usamos cookies para mejorar tu experiencia. ¿Aceptas el uso de cookies?",
    buttonLabelAccept = "Aceptar",
    buttonLabelDecline = "Rechazar",
    position = "bottom", // "top" o "bottom"
    customMargin = "",   // opcional: ej. "mt-6 mx-4" o "mb-4 ml-8 mr-8"
    localStorageKey = "cookie-consent",
}) {
    const CONSENT_MESSAGE = "Usamos cookies para mejorar tu experiencia. ¿Aceptas el uso de cookies?";
    const NOCONSENT_MESSAGE = "Usamos cookies esenciales para el funcionamiento del sitio. No se utilizan cookies de seguimiento o publicidad.";

    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(localStorageKey);

        const shouldShow =
            // No se ha guardado nada aún
            !stored ||
            // Se guardó "dismissed" pero ahora se espera consentimiento
            (stored === "dismissed" && consent) ||
            // Se guardó "accepted"/"declined" pero ahora NO se necesita consentimiento (mostrar simple aviso)
            ((stored === "accepted" || stored === "declined") && !consent);

        if (shouldShow) {
            setMounted(true);
            setTimeout(() => setVisible(true), 10);
        }

    }, [localStorageKey]);

    const handleClose = (action) => {
        if (action) localStorage.setItem(localStorageKey, action);
        setVisible(false);
        setTimeout(() => setMounted(false), 300);
    };

    if (!mounted) return null;

    const basePosition =
        position === "top"
            ? "top-4 sm:top-8"
            : "bottom-4 sm:bottom-8";

    return (
        <div
            className={`fixed left-4 right-4 sm:left-8 sm:right-8 z-10 transition-all duration-300 transform
                ${basePosition} ${customMargin}
                ${visible ? "opacity-100 translate-y-0" : position === "top" ? "opacity-0 -translate-y-4" : "opacity-0 translate-y-4"}
            `}
        >
            <div className="bg-white border shadow-lg rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-800">
                    {message !== CONSENT_MESSAGE
                        ? message
                        : consent
                            ? CONSENT_MESSAGE
                            : NOCONSENT_MESSAGE}
                </div>
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
            </div>
        </div>
    );
}
