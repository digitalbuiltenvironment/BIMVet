import React from 'react';
import { useTheme } from 'next-themes';
import 'iconify-icon';

const ThemeChanger: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      className="p-0.5"
      onClick={toggleTheme}
    >
      <div className="text-3xl">
        {theme === 'light' ? (
          <iconify-icon icon="line-md:moon-filled-to-sunny-filled-loop-transition"></iconify-icon>
        ) : (
          <iconify-icon icon="line-md:sunny-filled-loop-to-moon-filled-transition"></iconify-icon>
        )}
      </div>
    </button>
  );
};

export default ThemeChanger;
