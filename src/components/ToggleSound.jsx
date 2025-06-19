import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import audioService from "../servicies/audio";

const ToggleSound = () => {
  const [muted, setMuted] = useState(audioService.isMuted());

  useEffect(() => {
    audioService.mute(muted);
  }, [muted]);

  const toggle = () => setMuted(prev => !prev);

  return (
    <button
      onClick={toggle}
      title={muted ? "Sonido desactivado" : "Sonido activado"}
      className="p-2 rounded-full bg-gray-800 text-white shadow hover:bg-gray-700 transition"
    >
      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </button>
  );
};

export default ToggleSound;
