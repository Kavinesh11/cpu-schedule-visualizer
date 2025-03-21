
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Process, GanttItem, VisualizationState } from '@/types';
import { Clock, PlayCircle, PauseCircle, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface StepByStepVisualizationProps {
  visualizationState: VisualizationState;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  isPaused: boolean;
  isRunning: boolean;
  currentAlgorithm: string;
}

const StepByStepVisualization: React.FC<StepByStepVisualizationProps> = ({
  visualizationState,
  onPause,
  onResume,
  onSkip,
  isPaused,
  isRunning,
  currentAlgorithm
}) => {
  const { currentTime, runningProcess, readyQueue, completedProcesses, ganttChart } = visualizationState;
  const lastRenderTimeRef = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest Gantt chart item when updated
  useEffect(() => {
    if (ganttChart.length > 0 && containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [ganttChart.length]);

  // Calculate progress for running process
  const calculateProgress = () => {
    if (!runningProcess || runningProcess.burst_time === undefined || runningProcess.remaining_time === undefined) {
      return 0;
    }
    
    const completed = runningProcess.burst_time - runningProcess.remaining_time;
    return (completed / runningProcess.burst_time) * 100;
  };

  return (
    <Card className="glass-panel w-full">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">Step-by-Step Execution: {currentAlgorithm}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-base px-3 py-1 bg-white shadow-sm">
              Time: {currentTime}
            </Badge>
            <div className="flex gap-1">
              {isRunning && (
                <>
                  {isPaused ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full hover:bg-green-100"
                      onClick={onResume}
                    >
                      <PlayCircle className="h-5 w-5 text-green-600 mr-1" />
                      Resume
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full hover:bg-red-100"
                      onClick={onPause}
                    >
                      <PauseCircle className="h-5 w-5 text-red-600 mr-1" />
                      Pause
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full hover:bg-blue-100"
                    onClick={onSkip}
                  >
                    <SkipForward className="h-5 w-5 text-blue-600 mr-1" />
                    Skip
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center">
              <span className="bg-primary/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-primary font-semibold">1</span>
              CPU Execution
            </h3>
            <div className="bg-secondary/30 rounded-lg p-6 min-h-[150px] border border-secondary flex flex-col items-center justify-center">
              {runningProcess ? (
                <div className={`${runningProcess.color} w-full max-w-[280px] animate-pulse-subtle text-white font-medium px-6 py-4 rounded-md shadow-md`}>
                  <div className="text-center">
                    <div className="text-lg font-bold">Process P{runningProcess.id}</div>
                    <div className="text-sm opacity-90 mb-2">Executing...</div>
                    
                    <Progress value={calculateProgress()} className="h-2 mb-2 bg-black/20" />
                    
                    <div className="flex justify-between text-xs">
                      <div className="bg-black/20 px-2 py-1 rounded-full inline-block">
                        Burst: {runningProcess.burst_time} units
                      </div>
                      <div className="bg-black/20 px-2 py-1 rounded-full inline-block">
                        Remaining: {runningProcess.remaining_time} units
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center">
                  <div className="text-sm">CPU Idle</div>
                  <div className="text-xs mt-1">Waiting for next process...</div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center">
              <span className="bg-primary/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-primary font-semibold">2</span>
              Ready Queue
            </h3>
            <div className="bg-secondary/30 rounded-lg p-4 min-h-[150px] border border-secondary">
              {readyQueue.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {readyQueue.map((process) => (
                    <div 
                      key={process.id}
                      className={`${process.color} text-white font-medium px-3 py-2 rounded-md text-sm shadow-sm flex flex-col items-center transition-transform hover:scale-105`}
                    >
                      <div>P{process.id}</div>
                      <div className="text-xs mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                        Burst: {process.remaining_time}
                      </div>
                      <div className="text-xs mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                        Arrival: {process.arrival_time}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground h-full flex flex-col items-center justify-center">
                  <div className="text-sm">Queue Empty</div>
                  <div className="text-xs mt-1">No processes waiting</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center">
            <span className="bg-primary/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-primary font-semibold">3</span>
            Real-time Gantt Chart
          </h3>
          <div className="bg-secondary/30 rounded-lg p-4 border border-secondary overflow-x-auto" ref={containerRef}>
            <div className="flex min-w-max">
              {ganttChart.map((item, index) => {
                const width = Math.max(40, (item.endTime - item.startTime) * 30);
                const isLast = index === ganttChart.length - 1;
                
                return (
                  <div key={index} className="relative" style={{ width: `${width}px` }}>
                    <div 
                      className={`h-12 w-full flex items-center justify-center rounded-md border border-white/20 shadow-sm ${
                        item.processId !== null 
                          ? (runningProcess && runningProcess.id === item.processId 
                              ? runningProcess.color 
                              : completedProcesses.find(p => p.id === item.processId)?.color || 'bg-gray-400')
                          : 'bg-gray-200'
                      } ${isLast ? 'animate-pulse-subtle' : ''}`}
                    >
                      {item.processId !== null ? `P${item.processId}` : 'Idle'}
                      <span className="absolute left-0 -bottom-6 text-xs font-medium">
                        {item.startTime}
                      </span>
                      {isLast && (
                        <span className="absolute right-0 -bottom-6 text-xs font-medium">
                          {item.endTime}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center">
            <span className="bg-primary/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-primary font-semibold">4</span>
            Completed Processes
          </h3>
          <div className="bg-secondary/30 rounded-lg p-4 min-h-[80px] border border-secondary">
            {completedProcesses.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {completedProcesses.map((process) => (
                  <div 
                    key={process.id}
                    className={`${process.color} bg-opacity-80 text-white font-medium px-3 py-2 rounded-md text-sm shadow-sm flex items-center gap-2 transition-all hover:shadow-md`}
                  >
                    <div className="font-bold">P{process.id}</div>
                    <div className="text-xs bg-black/20 px-2 py-0.5 rounded-full">
                      TAT: {process.turnaround_time}
                    </div>
                    <div className="text-xs bg-black/20 px-2 py-0.5 rounded-full">
                      WT: {process.waiting_time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground w-full text-center">
                No processes completed yet
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepByStepVisualization;
