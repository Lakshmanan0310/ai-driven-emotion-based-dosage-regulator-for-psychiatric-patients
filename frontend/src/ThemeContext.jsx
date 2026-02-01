// ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    name: 'light',
    background: 'bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100',
    cardBg: 'bg-white/90',
    text: 'text-gray-800',
    subtext: 'text-gray-600',
    primary: 'from-pink-500 to-purple-500',
    secondary: 'from-purple-500 to-pink-400',
    accent: 'text-purple-600',
    accentBg: 'bg-purple-100',
    accentHover: 'hover:bg-purple-200',
    buttonBg: 'bg-gradient-to-r from-pink-500 to-purple-600',
    buttonHover: 'hover:from-pink-600 hover:to-purple-700',
    border: 'border-pink-200',
    shadow: 'shadow-pink-200/50',
    navActive: 'bg-pink-100 text-purple-700',
    navHover: 'hover:bg-pink-50',
    header: 'bg-white shadow-sm',
    icon: 'text-gray-500',
    inputText: 'text-gray-800',
    inputBg: 'bg-white',
    selectText: 'text-gray-800',
    selectBg: 'bg-white'
  },
  dark: {
    name: 'dark',
    background: 'bg-gradient-to-br from-blue-900 via-purple-900 to-blue-950',
    cardBg: 'bg-gray-800/90',
    text: 'text-gray-100',
    subtext: 'text-gray-300',
    primary: 'from-blue-600 to-purple-600',
    secondary: 'from-purple-600 to-blue-500',
    accent: 'text-purple-400',
    accentBg: 'bg-purple-900',
    accentHover: 'hover:bg-purple-800',
    buttonBg: 'bg-gradient-to-r from-blue-600 to-purple-600',
    buttonHover: 'hover:from-blue-700 hover:to-purple-700',
    border: 'border-blue-800',
    shadow: 'shadow-blue-900/50',
    navActive: 'bg-blue-800 text-purple-300',
    navHover: 'hover:bg-blue-900',
    header: 'bg-gray-900 shadow-md',
    icon: 'text-gray-300',
    inputText: 'text-white',
    inputBg: 'bg-gray-700',
    selectText: 'text-white',
    selectBg: 'bg-gray-700'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved && themes[saved] ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    
    // Apply theme to input fields to ensure text visibility
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      if (currentTheme === 'dark') {
        input.style.backgroundColor = themes.dark.inputBg.replace('bg-', '');
        input.style.color = 'white';
      } else {
        input.style.backgroundColor = 'white';
        input.style.color = 'black';
      }
    });
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// ThemeSwitcher.jsx
export const ThemeSwitcher = ({ className = '' }) => {
  const { currentTheme, setCurrentTheme, themes } = useTheme();
  
  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <button 
      onClick={toggleTheme}
      className={`flex items-center justify-center p-2 rounded-full transition-all ${className} ${
        currentTheme === 'light' 
          ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
          : 'bg-purple-900 text-purple-300 hover:bg-purple-800'
      }`}
      title={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} theme`}
      aria-label="Toggle theme"
    >
      {currentTheme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};