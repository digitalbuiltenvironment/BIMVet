// components/Sidebar.tsx
import React from 'react';
import ThemeChanger from '../components/ThemeChanger';

interface SidebarProps {
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarExpanded,
  toggleSidebar,
}) => {
  return (
    <div
      className={`transition-all ${
        sidebarExpanded
          ? 'lg:w-72 lg:h-screen bg-opacity-55 bg-gray-600'
          : 'lg:w-12 lg:h-screen'
      } z-10 transition-color duration-500`}
    >
      <button
        onClick={toggleSidebar}
        className={`w-8 h-8 flex text-white mt-2 transition-all duration-500 ml-auto mr-2 no-selection`}
      >
        <img
          src={
            sidebarExpanded
              ? '/static/assets/wsidebar_close.png'
              : '/static/assets/wsidebar_open.png'
          }
          alt={sidebarExpanded ? 'Collapse' : 'Expand'}
          className="fixed w-8 h-8 hover:brightness-50 transition-all duration-300 no-selection"
        />
      </button>
      {/* Sidebar content */}
      <div
        className={`fixed p-4 transition-opacity duration-400 ${
          sidebarExpanded ? 'opacity-100' : 'opacity-0'
        } flex flex-col justify-between h-full`}
      >
        <div>
          <h2 className="text-xl font-bold mb-4">Sidebar Content</h2>
          <p className="mb-2 border-b hover:font-bold hover:underline no-selection">
            Checker
          </p>
          <p className="mb-2 border-b hover:font-bold hover:underline no-selection">
            Checker
          </p>
      <ThemeChanger />
        </div>
        <div className="mt-auto">
          <div className="flex items-center border-t pt-2 w-full pb-10">
            <img
              src="/static/assets/usericon.png"
              className="w-10 h-10"
            />
            <p className="ml-2">Bottom Content</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
