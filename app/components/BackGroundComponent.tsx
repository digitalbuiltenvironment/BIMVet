// components/BackGroundComponent.tsx
import React, { ReactNode } from 'react';
import { useTheme } from 'next-themes';

interface BackGroundComponentProps {
  children: ReactNode;
}

const BackGroundComponent: React.FC<BackGroundComponentProps> = ({
  children,
}) => {
  const { theme } = useTheme();

  // Define the class based on the theme
  const backgroundClass =
    theme === 'light' ? 'background-gradient' : 'background-gradient-dark border-black';

  return <div className={`${backgroundClass}`}>{children}</div>;
};

export default BackGroundComponent;
