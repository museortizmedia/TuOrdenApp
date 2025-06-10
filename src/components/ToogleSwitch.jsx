import { CheckCircle, TimerIcon } from "lucide-react";
import React from "react";

const ToggleSwitch = ({
  checked,
  onChange,
  label = "",
  colors=["bg-gray-500", "bg-green-500"],
}) => {
  const handlePointerDown = (e) => e.stopPropagation();

  const handleChange = (e) => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    onChange(e);
  };

  const backgroundClass = checked ? colors[1] : colors[0];

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
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ${backgroundClass}`}
        />
        <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-200 shadow-md peer-checked:shadow-lg ${checked ? "translate-x-5" : ""} ${checked ? "translate-x-5 scale-105" : "scale-100"} cursor-pointer hover:bg-gray-200`}/>
      </label>
    </div>
  );
};

export default ToggleSwitch;