import { useEffect, useState } from "react";
import { useRestaurant } from "../../../contexts/RestaurantContext";
import firestoreService from "../../../servicies/firestoreService";
import toast, { Toaster } from "react-hot-toast";
import SliderManager from "../../../components/SliderManager";
// import ColorPickerSettings from "./components/ColorPickerSettings"; // futuro uso

const horas = Array.from({ length: 24 }, (_, h) =>
  [`${h.toString().padStart(2, "0")}:00`, `${h.toString().padStart(2, "0")}:30`]
).flat();

export default function AdminSettings() {
  const { restaurant } = useRestaurant();

  // Horarios
  const DIAS_SEMANA = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];
  const DIAS_LABEL = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    domingo: "Domingo",
  };
  const [horarios, setHorarios] = useState({});
  const [horariosCargados, setHorariosCargados] = useState({});

  // Slider
  const [slider, setSlider] = useState(restaurant.slider);

  // Otras
  useEffect(() => {
    const inicial = {};

    if (restaurant?.horarios) {
      try {
        const parsed = JSON.parse(restaurant.horarios);
        DIAS_SEMANA.forEach((dia) => {
          const rango = parsed[dia] || "";
          const [apertura, cierre] = rango?.split("-") || ["", ""];
          inicial[dia] = { apertura, cierre };
        });
      } catch (e) {
        console.error("Formato de horarios inválido");
        DIAS_SEMANA.forEach((dia) => {
          inicial[dia] = { apertura: "", cierre: "" };
        });
      }
    } else {
      DIAS_SEMANA.forEach((dia) => {
        inicial[dia] = { apertura: "", cierre: "" };
      });
    }

    setHorarios(inicial);
    setHorariosCargados(inicial);
  }, [restaurant]);


  const hayCambios = JSON.stringify(horarios) !== JSON.stringify(horariosCargados) || JSON.stringify(slider) !== JSON.stringify(restaurant?.slider || []);

  const guardarCambios = async () => {
    const formateados = {};

    const normalizarClave = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    for (const [dia, { apertura, cierre }] of Object.entries(horarios)) {
      const diaNormalizado = normalizarClave(dia);
      formateados[diaNormalizado] = apertura && cierre ? `${apertura}-${cierre}` : "";
    }

    const horariosString = JSON.stringify(formateados);

    firestoreService
      .update("restaurants", restaurant.id, {
        horarios: horariosString,
        slider,
      })
      .then(() => {
        toast.success("Datos actualizados correctamente");
        setHorariosCargados(horarios);
      })
      .catch((error) => {
        console.error("Error al guardar los datos:", error);
        toast.error("Error al guardar");
      });
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <div className="p-6 max-w-xl mx-auto text-white space-y-6">

        <h2 className="text-2xl font-bold">Horarios de atención</h2>
        {DIAS_SEMANA.map((dia) => {
          const apertura = horarios[dia]?.apertura || "";
          const cierre = horarios[dia]?.cierre || "";

          return (
            <div key={dia} className="flex items-center gap-3 mb-2">
              <label className="w-24 capitalize">{DIAS_LABEL[dia] || dia}</label>

              <select
                value={apertura}
                onChange={(e) =>
                  setHorarios((prev) => ({
                    ...prev,
                    [dia]: { ...prev[dia], apertura: e.target.value },
                  }))
                }
                className="bg-neutral-800 p-2 px-5 rounded"
              >
                {!horas.includes(apertura) && (
                  <option value="" disabled hidden>
                    — apertura —
                  </option>
                )}
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
                className="bg-neutral-800 p-2 px-5 rounded"
              >
                {!horas.includes(cierre) && (
                  <option value="" disabled hidden>
                    — cierre —
                  </option>
                )}
                {horas.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          );
        })}



        <SliderManager slider={slider} setSlider={setSlider} />

        {/* <ColorPickerSettings /> */}

        <button
          onClick={guardarCambios}
          disabled={!hayCambios}
          className={`mt-4 px-4 py-2 rounded font-semibold transition ${hayCambios
            ? "bg-yellow-500 hover:bg-yellow-400 text-black cursor-pointer"
            : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
        >
          Guardar cambios
        </button>
      </div>
    </>
  );
}
