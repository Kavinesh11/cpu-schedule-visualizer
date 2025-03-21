
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Process } from '@/types';
import { Clock } from 'lucide-react';

interface VisualizationProps {
  runningProcess: Process | null;
  readyQueue: Process[];
  currentTime: number;
}

const Visualization: React.FC<VisualizationProps> = ({
  runningProcess,
  readyQueue,
  currentTime
}) => {
  return (
    <Card className="glass-panel w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Real-Time Visualization <span className="ml-auto text-base font-normal">Time: {currentTime}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">CPU</h3>
          <div className="bg-secondary/50 rounded-lg p-6 min-h-[100px] flex items-center justify-center">
            {runningProcess ? (
              <div className={`${runningProcess.color} animate-process-running text-white font-medium px-6 py-4 rounded-md`}>
                Process P{runningProcess.id} (Remaining: {runningProcess.remaining_time})
              </div>
            ) : (
              <div className="text-muted-foreground">Idle</div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Ready Queue</h3>
          <div className="bg-secondary/50 rounded-lg p-4 min-h-[80px] flex flex-wrap items-center gap-2">
            {readyQueue.length > 0 ? (
              readyQueue.map((process) => (
                <div 
                  key={process.id}
                  className={`${process.color} text-white font-medium px-3 py-2 rounded-md text-sm animate-pulse-subtle`}
                >
                  P{process.id} (Burst: {process.remaining_time})
                </div>
              ))
            ) : (
              <div className="text-muted-foreground w-full text-center">Queue Empty</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Visualization;
