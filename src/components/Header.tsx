
import React from 'react';
import { Cpu } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full py-6 px-4 sm:px-8 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Cpu className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">CPU Scheduler</h1>
            <p className="text-sm text-muted-foreground">Algorithm Visualization Tool</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
