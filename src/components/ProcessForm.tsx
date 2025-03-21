
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Process } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface ProcessFormProps {
  onAddProcess: (process: Omit<Process, 'id' | 'color'>) => void;
  processes: Process[];
  onRemoveProcess: (id: number) => void;
  isRunning: boolean;
}

const ProcessForm: React.FC<ProcessFormProps> = ({ 
  onAddProcess, 
  processes, 
  onRemoveProcess,
  isRunning
}) => {
  const [arrivalTime, setArrivalTime] = useState<number>(0);
  const [burstTime, setBurstTime] = useState<number>(1);
  const [priority, setPriority] = useState<number>(1);

  const handleAddProcess = () => {
    if (burstTime <= 0) {
      toast({
        title: "Invalid burst time",
        description: "Burst time must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    onAddProcess({
      arrival_time: arrivalTime,
      burst_time: burstTime,
      priority: priority,
      remaining_time: burstTime
    });

    toast({
      title: "Process added",
      description: `Process with burst time ${burstTime} added successfully.`
    });

    // Reset form fields
    setArrivalTime(0);
    setBurstTime(1);
    setPriority(1);
  };

  return (
    <Card className="glass-panel w-full">
      <CardHeader>
        <CardTitle className="text-lg">Add Process</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="arrival-time">Arrival Time</Label>
            <Input
              id="arrival-time"
              type="number"
              min="0"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(Number(e.target.value))}
              disabled={isRunning}
              className="bg-white/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="burst-time">Burst Time</Label>
            <Input
              id="burst-time"
              type="number"
              min="1"
              value={burstTime}
              onChange={(e) => setBurstTime(Number(e.target.value))}
              disabled={isRunning}
              className="bg-white/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority (Lower is Higher)</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              disabled={isRunning}
              className="bg-white/50"
            />
          </div>
        </div>
        <Button 
          onClick={handleAddProcess}
          disabled={isRunning || burstTime <= 0}
          className="w-full"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Process
        </Button>
      </CardContent>

      <CardHeader className="border-t border-gray-100 mt-4">
        <CardTitle className="text-lg">Process List</CardTitle>
      </CardHeader>
      <CardContent>
        {processes.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No processes added yet. Add a process to start.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary rounded-md">
                  <th className="p-2 text-left">Process ID</th>
                  <th className="p-2 text-left">Arrival Time</th>
                  <th className="p-2 text-left">Burst Time</th>
                  <th className="p-2 text-left">Priority</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((process) => (
                  <tr key={process.id} className="border-b border-gray-100 last:border-0">
                    <td className="p-2">
                      <div className={`inline-block w-6 h-6 rounded-full mr-2 ${process.color}`}></div>
                      P{process.id}
                    </td>
                    <td className="p-2">{process.arrival_time}</td>
                    <td className="p-2">{process.burst_time}</td>
                    <td className="p-2">{process.priority}</td>
                    <td className="p-2 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveProcess(process.id)}
                        disabled={isRunning}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessForm;
