import { useState } from "react";

export default function SliderManager({ slider, setSlider }) {
  const [newUrl, setNewUrl] = useState("");

  const addUrl = () => {
    const trimmed = newUrl.trim();
    if (trimmed && !slider.includes(trimmed)) {
      setSlider([...slider, trimmed]);
      setNewUrl("");
    }
  };

  const removeUrl = (index) => {
    const updated = [...slider];
    updated.splice(index, 1);
    setSlider(updated);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold">Imágenes del slider</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="URL de imagen"
          className="flex-1 bg-neutral-800 text-white p-2 rounded"
        />
        <button
          onClick={addUrl}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white"
        >
          Añadir
        </button>
      </div>

      <ul className="space-y-1">
        {slider.map((url, index) => (
          <li key={index} className="flex justify-between items-center bg-neutral-900 p-2 rounded">
            <span className="text-sm truncate">{url}</span>
            <button
              onClick={() => removeUrl(index)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
