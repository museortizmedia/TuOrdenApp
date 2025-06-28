import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function ListManager({
  title = "Lista de elementos",
  placeholder = "Nuevo elemento",
  items = [],
  setItems,
  ...props
}) {
  const [newItem, setNewItem] = useState("");
  const [isOpen, setIsOpen] = useState(false); // 👈 Panel abierto/cerrado

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!Array.isArray(items)) return;
    if (trimmed && !items.includes(trimmed)) {
      setItems([...items, trimmed]);
      setNewItem("");
    }
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  return (
    <div className="border rounded bg-neutral-800 text-white" {...props}>
      {/* Encabezado colapsable */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left font-bold text-md hover:bg-neutral-700 transition"
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Contenido del panel */}
      {isOpen && (
        <div className="space-y-3 mt-2 px-4 pb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-neutral-700 text-white p-2 rounded"
            />
            <button
              onClick={addItem}
              className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white"
            >
              Añadir
            </button>
          </div>

          <ul className="space-y-2">
            {Array.isArray(items) &&
              items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-neutral-900 p-2 rounded"
                >
                  <span className="text-sm truncate">{item}</span>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/*
<ListManager
  title="Imágenes del slider"
  placeholder="URL de imagen"
  items={slider}
  setItems={setSlider}
/>

<ListManager
  title="Correos autorizados"
  placeholder="Correo electrónico"
  items={emails}
  setItems={setEmails}
/>
*/