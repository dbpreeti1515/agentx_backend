import React from "react";
import { IconSun, IconMoon } from "./Icons";

export function ThemeToggle({ theme, onToggle }) {
  return (
    <button 
      className={`theme-toggle theme-toggle--${theme}`} 
      onClick={onToggle}
      aria-label="Toggle theme"
    >
      <div className="theme-toggle__track">
        <div className="theme-toggle__thumb">
          {theme === "light" ? <IconSun /> : <IconMoon />}
        </div>
      </div>
    </button>
  );
}
