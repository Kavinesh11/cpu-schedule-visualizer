
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GanttItem, Process } from '@/types';
import { BarChart3, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GanttChartProps {
  data: GanttItem[];
  processes: Process[];
}

const GanttChart: React.FC<GanttChartProps> = ({ data, processes }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="glass-panel w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            CPU Timeline (Gantt Chart)
          </CardTitle>
          <CardDescription>
            Run one of the scheduling algorithms to see the CPU utilization timeline
          </CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center bg-secondary/10 rounded-lg my-2">
          <div className="text-muted-foreground text-center flex flex-col items-center">
            <BarChart3 className="h-10 w-10 mb-2 text-muted-foreground/50" />
            <p>No data available yet. Start a scheduling algorithm to visualize the timeline.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find the process color by id
  const getProcessColor = (id: number | null): string => {
    if (id === null) return 'bg-gray-200';
    const process = processes.find(p => p.id === id);
    return process?.color || 'bg-gray-400';
  };

  return (
    <Card className="glass-panel w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            CPU Timeline (Gantt Chart)
          </CardTitle>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-full p-1 bg-primary/10 hover:bg-primary/20 cursor-help">
                  <Info className="h-4 w-4 text-primary" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>The Gantt Chart shows how processes are scheduled over time. Each block represents a process execution with its corresponding time units.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Visualizes how processes are scheduled over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-6 pt-2">
          <div className="flex min-w-max">
            {data.map((item, index) => {
              const width = Math.max(40, (item.endTime - item.startTime) * 30); // Scale time units
              const color = getProcessColor(item.processId);
              const duration = item.endTime - item.startTime;
              
              return (
                <div key={index} className="relative group" style={{ width: `${width}px`, minWidth: '30px' }}>
                  <div 
                    className={`${color} transition-all duration-200 h-14 w-full flex items-center justify-center rounded-md border border-white/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 group-hover:ring-2 ring-primary/20`}
                  >
                    {item.processId !== null ? (
                      <div className="flex flex-col items-center">
                        <span className="font-medium">P{item.processId}</span>
                        {duration > 1 && (
                          <span className="text-xs opacity-80">{duration} units</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">Idle</span>
                    )}
                    
                    <span className="absolute -left-0.5 -bottom-7 text-xs text-muted-foreground whitespace-nowrap">
                      {item.startTime}
                    </span>
                    
                    {index === data.length - 1 && (
                      <span className="absolute -right-0.5 -bottom-7 text-xs text-muted-foreground">
                        {item.endTime}
                      </span>
                    )}
                  </div>
                  
                  {/* Show process details on hover */}
                  {item.processId !== null && (
                    <div className="absolute top-full mt-10 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-48 pointer-events-none">
                      <div className="text-sm font-medium">Process P{item.processId}</div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-xs">
                        <div className="text-muted-foreground">Start Time:</div>
                        <div>{item.startTime}</div>
                        <div className="text-muted-foreground">End Time:</div>
                        <div>{item.endTime}</div>
                        <div className="text-muted-foreground">Duration:</div>
                        <div>{item.endTime - item.startTime} units</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Timeline scale */}
          <div className="h-8 border-t border-gray-200 mt-8 relative">
            {data.length > 0 && (
              <div className="absolute top-2 left-0 right-0 text-xs text-muted-foreground text-center">
                Time Units
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;
