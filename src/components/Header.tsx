
import React from 'react';
import { Cpu, Github, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="w-full py-4 px-4 sm:px-8 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
              CPU Scheduler
            </h1>
            <p className="text-sm text-muted-foreground">
              Interactive Algorithm Visualization Tool
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="hidden md:flex gap-1" asChild>
            <a href="https://en.wikipedia.org/wiki/Scheduling_(computing)" target="_blank" rel="noopener noreferrer">
              <BookOpen className="h-4 w-4" />
              <span>Learn</span>
            </a>
          </Button>
          
          <Button variant="outline" size="sm" className="gap-1" asChild>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              <span className="hidden md:inline">GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
