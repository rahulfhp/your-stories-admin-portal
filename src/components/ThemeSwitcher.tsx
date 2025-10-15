"use client";

import React from 'react';
import { useThemeStore } from '@/stores/theme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface ThemeSwitcherProps {
  className?: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-14 h-7 rounded-full cursor-pointer
        transition-all duration-300 ease-in-out
        backdrop-blur-xl border
        hover:scale-105 active:scale-95
        focus:outline-none
        ${
          theme === "dark"
            ? "bg-gray-800/60 border-white/20 hover:bg-gray-700/70"
            : "bg-white/40 border-gray-300/30 hover:bg-white/60"
        }
        ${className}
      `}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {/* Toggle indicator */}
      <div
        className={`
          absolute w-6 h-6 rounded-full
          transition-all duration-300 ease-in-out
          backdrop-blur-sm border
          flex items-center justify-center
          ${
            theme === "dark"
              ? "-translate-x-3.5 bg-white border-gray-200 shadow-lg"
              : "translate-x-3.5 bg-gray-800 border-gray-600 shadow-lg"
          }
        `}
      >
        {theme === "dark" ? (
          <MoonIcon className="w-4 h-4 text-blue-600" />
        ) : (
          <SunIcon className="w-4 h-4 text-yellow-400" />
        )}
      </div>

      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1">
        <MoonIcon
          className={`w-4 h-4 transition-opacity duration-300 ${
            theme === "dark"
              ? "opacity-60 text-blue-300"
              : "opacity-30 text-gray-600"
          }`}
        />
        <SunIcon
          className={`w-4 h-4 transition-opacity duration-300 ${
            theme === "dark"
              ? "opacity-30 text-gray-400"
              : "opacity-60 text-yellow-500"
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeSwitcher;