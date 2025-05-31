import React from "react";
import theme from "./theme";

export default function ThemeShowcase() {
  return (
    <div className={`${theme.layout.darkBackground} min-h-screen p-8`}>
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Logo */}
        <section className="flex justify-center">
          <img
            src="https://images.rappi.com/restaurants_logo/22-1715892877747.png"
            alt="Promo Logo"
            className="w-40 h-auto rounded-xl shadow-md"
          />
        </section>

        {/* Typography */}
        <section>
          <h2 className={`${theme.text.bold} ${theme.text.lg}`}>Typography</h2>
          <p className={theme.text.xl}>Extra Large Text</p>
          <p className={theme.text.lg}>Large Text</p>
          <p className={theme.text.md}>Medium Text</p>
        </section>

        {/* Text Colors */}
        <section>
          <h2 className={`${theme.text.bold} ${theme.text.lg}`}>Text Colors</h2>
          <p className={theme.colors.text.primary}>Primary Red (#9d100f)</p>
          <p className={theme.colors.text.secondary}>Secondary Yellow (#f6d926)</p>
        </section>

        {/* Backgrounds */}
        <section>
          <h2 className={`${theme.text.bold} ${theme.text.lg}`}>Backgrounds</h2>
          <div className={`${theme.colors.background.primary} p-4 rounded mb-2`}>
            Primary Background
          </div>
          <div className={`${theme.colors.background.secondary} p-4 rounded`}>
            Secondary Background
          </div>
        </section>

        {/* Borders */}
        <section>
          <h2 className={`${theme.text.bold} ${theme.text.lg}`}>Borders</h2>
          <div className={`${theme.colors.border.primary} p-4 rounded`}>
            Red Border
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className={`${theme.text.bold} ${theme.text.lg}`}>Buttons</h2>
          <button className={`${theme.buttons.primary} ${theme.effects.hoverGrow} mr-4`}>
            Primary CTA
          </button>
          <button className={`${theme.buttons.secondary} ${theme.effects.hoverGrow}`}>
            Secondary CTA
          </button>
        </section>

        {/* Visual Effects */}
        <section>
          <h2 className={`${theme.text.bold} ${theme.text.lg}`}>Visual Effects</h2>
          <div className={`${theme.containers.burgerGlow} ${theme.effects.softShadow} p-6`}>
            Glowing Box
          </div>
        </section>

      </div>
    </div>
  );
}
