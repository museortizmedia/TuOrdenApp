const theme = {
  layout: {
    darkBackground: "bg-[#050505] text-white",
    centeredContainer: "flex flex-col items-center justify-center text-center p-4 space-y-4",
  },

  text: {
    bold: "font-bold tracking-wide",
    xl: "text-5xl md:text-6xl",
    lg: "text-2xl md:text-3xl",
    md: "text-lg md:text-xl",
    white: "text-white",
    red: "text-[#9d100f]",
    yellow: "text-[#f6d926]",
  },

  colors: {
    text: {
      primary: "text-[#9d100f] hover:text-[#b31312]",
      secondary: "text-[#f6d926] hover:text-yellow-400",
    },
    background: {
      primary: "bg-[#9d100f] hover:bg-[#b31312]",
      secondary: "bg-[#f6d926] hover:bg-yellow-400 text-black",
      dark: "bg-[#050505] text-white",
      darkLight: "bg-[#1a1a1a]",
      darkMedium: "bg-[#121212]",
      darkLighter: "bg-[#1f1f1f]",
      backgroundGradient: "bg-gradient-to-b from-[#1a1a1a] to-[#050505]",
    },
    border: {
      primary: "border-2 border-[#9d100f] hover:border-[#b31312]",
    },
  },

  containers: {
    redHighlight: "bg-[#9d100f] text-white",
    redBorder: "border-2 border-[#9d100f]",
    burgerGlow: "ring-4 ring-[#f6d926]/30 rounded-xl",
    headerBar: "bg-[#1a1a1a] text-white px-4 py-2",
    labelBox: "bg-[#1f1f1f] text-white px-2 py-1 rounded",
    section: "bg-gradient-to-b from-[#1a1a1a] to-[#050505] p-4 rounded",
  },

  buttons: {
    primary: "bg-[#9d100f] hover:bg-[#b31312] text-white font-extrabold px-4 py-2 rounded transition-colors",
    secondary: "bg-[#f6d926] hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded transition-colors",
    dark: "bg-[#101010] hover:bg-[#2e2e2e] text-white font-semibold px-4 py-2 rounded transition-colors",
  },

  effects: {
    softShadow: "shadow-md shadow-[#f6d926]/30",
    hoverGrow: "hover:scale-105 transition-transform duration-200 ease-in-out",
  },
};

export default theme;