'use client';

import * as React from 'react';
import { Menu, X } from 'lucide-react';

interface ResponsiveLayoutWrapperProps {
  sidebar: React.ReactNode;
  headerTitle: React.ReactNode;
  userBadge: React.ReactNode;
  children: React.ReactNode;
}

export function ResponsiveLayoutWrapper({
  sidebar,
  headerTitle,
  userBadge,
  children,
}: ResponsiveLayoutWrapperProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-[#F7F7F7] overflow-hidden font-sans relative">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block h-full flex-shrink-0">
        {sidebar}
      </div>

      {/* Sidebar Drawer for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#222222]/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white h-full animate-in slide-in-from-left duration-300">
            {/* Close Button inside Drawer */}
            <div className="absolute top-3 right-3 z-10">
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg border border-[#DDDDDD] hover:bg-gray-100 text-[#717171] hover:text-[#222222]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* The actual sidebar */}
            <div className="h-full flex flex-col" onClick={() => setIsOpen(false)}>
              {sidebar}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#DDDDDD] flex items-center justify-between px-4 md:px-8 flex-shrink-0 gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-lg border border-[#DDDDDD] hover:bg-gray-100 text-[#717171] hover:text-[#222222] flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            {headerTitle}
          </div>
          <div className="flex-shrink-0">
            {userBadge}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F7F7F7]">
          {children}
        </main>
      </div>
    </div>
  );
}
