/** @typedef {'autoInteract' | 'manualInteract' | 'positive' | 'negative' | 'alert' | 'alert2'} AudioKey */

const audioFiles = {
  autoInteract: "/assets/audios/Pop.mp3",
  manualInteract: "/assets/audios/Pap.mp3",
  positive: "/assets/audios/Positive.mp3",
  negative: "/assets/audios/Negative.mp3",
  alert: "/assets/audios/DingDang.mp3",
  alert2: "/assets/audios/Paper.mp3",
};

/** @type {Record<AudioKey, HTMLAudioElement>} */
const audioInstances = {};

Object.entries(audioFiles).forEach(([key, path]) => {
  const audio = new Audio(path);
  audio.preload = "auto";
  audioInstances[key] = audio;
});

// 🔇 Estado de mute almacenado en sessionStorage
const isMuted = () => sessionStorage.getItem("audioMuted") === "true";

const setMuted = (muted) => {
  sessionStorage.setItem("audioMuted", muted ? "true" : "false");
};

/**
 * Reproduce un sonido por clave
 * @param {AudioKey} key
 */
const playAudio = (key) => {
  if (isMuted()) return;
  const audio = audioInstances[key];
  if (!audio) return;

  try {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {
    console.warn(`Error al reproducir "${key}"`, e);
  }
};

const audioService = {
  ...audioInstances,
  /** @type {(key: AudioKey) => void} */
  play: playAudio,
  /** @type {(mute: boolean) => void} */
  mute: setMuted,
  /** @type {() => boolean} */
  isMuted,
};

export default audioService;