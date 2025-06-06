import React, { useState } from "react";
import { ImagePlus } from "lucide-react";

const ImageUploader = ({ onImageSelect }) => {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      if (onImageSelect) onImageSelect(file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-xs space-y-3">
      <label className="cursor-pointer flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition">
        <ImagePlus className="w-5 h-5" />
        <span>{preview?"Cambiar imagen":"Subir imagen"}</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {fileName && (
        <p className="text-sm text-gray-600 text-center">Archivo: {fileName}</p>
      )}

      {preview && (
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-auto object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;