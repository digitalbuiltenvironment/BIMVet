import React from 'react';
import { useTheme } from 'next-themes';
import { Icon } from '@iconify/react';

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
          <Icon icon="line-md:moon-filled-to-sunny-filled-loop-transition"></Icon>
        ) : (
          <Icon icon="line-md:sunny-filled-loop-to-moon-filled-transition"></Icon>
        )}
      </div>
    </button>
  );
};

export default ThemeChanger;
