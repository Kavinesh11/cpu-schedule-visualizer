
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GanttItem, Process } from '@/types';
import { BarChart3 } from 'lucide-react';

interface GanttChartProps {
  data: GanttItem[];
  processes: Process[];
}

const GanttChart: React.FC<GanttChartProps> = ({ data, processes }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="glass-panel w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gantt Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <p className="text-muted-foreground">Run the algorithm to see the Gantt chart</p>
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
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Gantt Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-max">
            {data.map((item, index) => {
              const width = Math.max(40, (item.endTime - item.startTime) * 30); // Scale time units
              
              return (
                <div key={index} className="relative" style={{ width: `${width}px` }}>
                  <div 
                    className={`gantt-box ${getProcessColor(item.processId)} h-12 w-full flex items-center justify-center rounded-md`}
                  >
                    {item.processId !== null ? `P${item.processId}` : 'Idle'}
                    <span className="absolute left-0 -bottom-6 text-xs">
                      {item.startTime}
                    </span>
                    {index === data.length - 1 && (
                      <span className="absolute right-0 -bottom-6 text-xs">
                        {item.endTime}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;
