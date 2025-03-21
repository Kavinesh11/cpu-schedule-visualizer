
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProcessForm from '@/components/ProcessForm';
import AlgorithmSelector from '@/components/AlgorithmSelector';
import StepByStepVisualization from '@/components/StepByStepVisualization';
import GanttChart from '@/components/GanttChart';
import Statistics from '@/components/Statistics';
import { useCPUScheduler } from '@/hooks/useCPUScheduler';

const Index = () => {
  const {
    processes,
    addProcess,
    removeProcess,
    updateProcess,
    timeQuantum,
    setTimeQuantum,
    currentAlgorithm,
    setCurrentAlgorithm,
    runSchedulingAlgorithm,
    result,
    isRunning,
    isPaused,
    setIsPaused,
    visualizationSpeed,
    setVisualizationSpeed,
    visualizationState,
    skipVisualization,
    cleanupAnimations
  } = useCPUScheduler();
  
  // Set up some example processes on first load
  useEffect(() => {
    // Only add example processes if there are none
    if (processes.length === 0) {
      addProcess({ arrival_time: 0, burst_time: 5, priority: 2 });
      addProcess({ arrival_time: 1, burst_time: 3, priority: 1 });
      addProcess({ arrival_time: 2, burst_time: 8, priority: 4 });
      addProcess({ arrival_time: 3, burst_time: 2, priority: 3 });
    }
    
    // Cleanup animations on unmount
    return () => {
      cleanupAnimations();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProcessForm 
            onAddProcess={addProcess}
            processes={processes}
            onRemoveProcess={removeProcess}
            isRunning={isRunning}
          />
          
          <AlgorithmSelector 
            currentAlgorithm={currentAlgorithm}
            setCurrentAlgorithm={setCurrentAlgorithm}
            timeQuantum={timeQuantum}
            setTimeQuantum={setTimeQuantum}
            onRun={runSchedulingAlgorithm}
            isRunning={isRunning}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            visualizationSpeed={visualizationSpeed}
            setVisualizationSpeed={setVisualizationSpeed}
          />
        </div>

        {isRunning && (
          <StepByStepVisualization 
            visualizationState={visualizationState}
            onPause={() => setIsPaused(true)}
            onResume={() => setIsPaused(false)}
            onSkip={skipVisualization}
            isPaused={isPaused}
            isRunning={isRunning}
            currentAlgorithm={currentAlgorithm}
          />
        )}

        <GanttChart 
          data={result?.ganttChart || []}
          processes={processes}
        />

        <Statistics result={result} />
        
        <footer className="text-center text-sm text-muted-foreground mt-16 pb-8">
          <p>CPU Scheduling Visualizer - A tool for learning about operating system scheduling algorithms</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
