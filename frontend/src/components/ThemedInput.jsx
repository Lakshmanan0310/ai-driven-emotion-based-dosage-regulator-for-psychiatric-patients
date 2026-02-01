import React from 'react';
import { useTheme } from '../ThemeContext';

export const ThemedInput = ({ type = 'text', id, name, value, onChange, placeholder, className = '', ...props }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 ${className} border ${theme.border} rounded-lg ${theme.inputBg} ${theme.inputText}`}
      placeholder={placeholder}
      {...props}
    />
  );
};

export const ThemedInputWithIcon = ({ type = 'text', id, name, value, onChange, placeholder, icon: Icon, className = '', ...props }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 pl-10 ${className} border ${theme.border} rounded-lg ${theme.inputBg} ${theme.inputText}`}
        placeholder={placeholder}
        {...props}
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className={theme.icon} />
      </div>
    </div>
  );
};

export const ThemedCard = ({ children, className = '' }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  return (
    <div className={`${theme.cardBg} rounded-lg shadow ${theme.shadow} ${className}`}>
      {children}
    </div>
  );
};

export const ThemedText = ({ children, className = '', element = 'p' }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const Element = element;
  
  return (
    <Element className={`${theme.text} ${className}`}>
      {children}
    </Element>
  );
};

export const ThemedSubtext = ({ children, className = '', element = 'p' }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const Element = element;
  
  return (
    <Element className={`${theme.subtext} ${className}`}>
      {children}
    </Element>
  );
};
