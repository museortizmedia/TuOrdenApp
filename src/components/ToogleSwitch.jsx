import React from "react";

const ToggleSwitch = ({ checked, onChange, label = "" }) => {
  const handlePointerDown = (e) => e.stopPropagation();

  const handleChange = (e) => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    onChange(e);
  };


  return (
    <div className="flex items-center gap-2 mt-2" onPointerDownCapture={handlePointerDown}>
      {label && <label className="text-xs">{label}</label>}
      <label className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={handleChange}
        />
        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-200" />
        <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 peer-checked:translate-x-5 cursor-pointer" />
      </label>
    </div>
  );
};

export default ToggleSwitch;