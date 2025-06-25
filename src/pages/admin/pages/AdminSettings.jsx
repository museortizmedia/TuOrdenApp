import { useEffect, useState } from "react";
import { useRestaurant } from "../../../contexts/RestaurantContext";
import firestoreService from "../../../servicies/firestoreService";
import toast, { Toaster } from "react-hot-toast";

const horas = Array.from({ length: 24 }, (_, h) =>
  [`${h.toString().padStart(2, "0")}:00`, `${h.toString().padStart(2, "0")}:30`]
).flat();

export default function AdminSettings() {
  const { restaurant } = useRestaurant();

  const [horarios, setHorarios] = useState({});
  const [horariosCargados, setHorariosCargados] = useState({});

  useEffect(() => {
    if (!restaurant?.horarios) return;

    try {
      const parsed = JSON.parse(restaurant.horarios);
      const inicial = {};
      for (const [dia, rango] of Object.entries(parsed)) {
        const [apertura, cierre] = rango?.split("-") || ["", ""];
        inicial[dia] = { apertura, cierre };
      }
      setHorarios(inicial);
      setHorariosCargados(inicial);
    } catch (e) {
      console.error("Formato de horarios inválido");
    }
  }, [restaurant?.horarios]);

  const guardarHorarios = async () => {
    const formateados = {};

    const normalizarClave = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    for (const [dia, { apertura, cierre }] of Object.entries(horarios)) {
      const diaNormalizado = normalizarClave(dia);
      formateados[diaNormalizado] = apertura && cierre ? `${apertura}-${cierre}` : "";
    }

    const horariosString = JSON.stringify(formateados);

    firestoreService
      .update("restaurants", restaurant.id, { horarios: horariosString })
      .then(() => {
        toast.success("Horarios actualizados correctamente");
        setHorariosCargados(horarios); // Actualizar referencia original
      })
      .catch((error) => {
        console.error("Error al guardar los horarios:", error);
        toast.error("Error al guardar los horarios");
      });
  };

  const hayCambios = JSON.stringify(horarios) !== JSON.stringify(horariosCargados);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <div className="p-6 max-w-xl mx-auto text-white space-y-4">
        <h2 className="text-2xl font-bold mb-4">Horarios de atención</h2>

        {Object.entries(horarios).map(([dia, { apertura, cierre }]) => (
          <div key={dia} className="flex items-center gap-3 mb-2">
            <label className="w-24 capitalize">{dia}</label>
            <select
              value={apertura}
              onChange={(e) =>
                setHorarios((prev) => ({
                  ...prev,
                  [dia]: { ...prev[dia], apertura: e.target.value },
                }))
              }
              className="bg-neutral-800 p-2 rounded"
            >
              <option value="">— apertura —</option>
              {horas.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span className="text-gray-400">–</span>
            <select
              value={cierre}
              onChange={(e) =>
                setHorarios((prev) => ({
                  ...prev,
                  [dia]: { ...prev[dia], cierre: e.target.value },
                }))
              }
              className="bg-neutral-800 p-2 rounded"
            >
              <option value="">— cierre —</option>
              {horas.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button
          onClick={guardarHorarios}
          disabled={!hayCambios}
          className={`mt-4 px-4 py-2 rounded font-semibold transition ${hayCambios
              ? "bg-yellow-500 hover:bg-yellow-400 text-black cursor-pointer"
              : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
        >
          Guardar horarios
        </button>
      </div>
    </>
  );
}