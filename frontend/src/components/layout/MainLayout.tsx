import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useDemo } from '../../context/DemoContext';
import { DemoBanner } from '../demo/DemoBanner';
import { DemoTimer } from '../demo/DemoTimer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isDemoMode } = useDemo();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isDemoMode && <DemoBanner />}
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main
          className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1920px] w-full"
          style={{ marginTop: isDemoMode ? '88px' : '64px' }}
        >
          <div className="mx-auto">
            {children}
          </div>
        </main>
      </div>
      {isDemoMode && <DemoTimer />}
    </div>
  );
};

