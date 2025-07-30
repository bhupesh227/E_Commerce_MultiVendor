"use client";
import Sidebar from 'apps/sellers-ui/src/shared/sidebar/Sidebar';
import { Menu, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => (
  <header className="md:hidden bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-b-slate-800">
    <button onClick={onMenuClick} className="text-white">
      <Menu size={24} />
    </button>
  </header>
);

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex h-full bg-black min-h-screen">
      <aside className="w-[280px] min-w-[250px] max-w-[300px] border-r border-r-slate-800 text-white p-4 hidden md:block">
        <div className="sticky top-0">
          <Sidebar />
        </div>
      </aside>
      <div className={`md:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {isSidebarOpen && (
          <div
            className="fixed inset-0 "
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <div className="relative w-[280px] h-full bg-black border-r border-r-slate-800 p-4 text-white">
           <button
             onClick={() => setIsSidebarOpen(false)}
             className="absolute top-1 right-1 text-blue-500 cursor-pointer"
           >
             <X size={30} />
           </button>
          <Sidebar />
        </div>
      </div>
      <main className="flex-1 flex flex-col">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;