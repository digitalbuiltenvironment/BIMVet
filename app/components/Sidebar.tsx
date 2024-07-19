// components/Sidebar.tsx
import React from 'react';
import ThemeChanger from '../components/ThemeChanger';
import { useTheme } from 'next-themes';
import 'iconify-icon';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SidebarProps {
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarExpanded,
  toggleSidebar,
}) => {
  const { theme, setTheme } = useTheme();
  return (
    <div
      className={`backdrop-blur ${
        sidebarExpanded
          ? 'lg:w-72 lg:h-screen bg-opacity-55 bg-gray-600'
          : 'lg:w-12 lg:h-screen'
      }`}
      style={{
        transitionProperty:
          'width, height, margin, padding, opacity, background',
        transitionDuration: '0.35s',
        transitionTimingFunction: 'ease-in-out',
      }}
    >
      <button
        onClick={toggleSidebar}
        className={`p-0.5 text-3xl flex mt-2 transition-opacity duration-400 ml-auto mr-2 no-selection`}
      >
        <iconify-icon
          icon={
            sidebarExpanded
              ? 'tabler:layout-sidebar-right-expand-filled'
              : 'tabler:layout-sidebar-left-expand-filled'
          }
        ></iconify-icon>
      </button>
      {/* Sidebar content */}
      <div
        className={`fixed p-4 transition-opacity duration-200 transition-color ${
          sidebarExpanded ? 'opacity-100' : 'opacity-0'
        } flex flex-col justify-between h-full`}
      >
        <div
          className={`fixed ml-2 mt-2 top-0 left-0 ${
            sidebarExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <ThemeChanger />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">BIMVet</h2>
          <p
            className={`mb-2 border-b font-medium hover:font-bold hover:underline no-selection cursor-pointer ${
              theme === 'dark' ? 'border-white' : 'border-black'
            }`}
          >
            <Link href="/">Checker</Link>
          </p>
          <p
            className={`mb-2 border-b font-medium hover:font-bold hover:underline no-selection cursor-pointer ${
              theme === 'dark' ? 'border-white' : 'border-black'
            }`}
          >
            <Link href="/csvViewer">Report Viewer</Link>

          </p>
        </div>
        <div className="mt-auto">
          <div
            className={`flex text-xl items-center border-t pt-2 w-full pb-10  ${
              theme === 'dark' ? 'border-white' : 'border-black'
            }`}
          >
            <div className="text-4xl font-bold">
              <iconify-icon icon="iconoir:user-circle"></iconify-icon>
            </div>
            <p className="ml-2 font-medium no-selection mb-2"></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
