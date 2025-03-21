
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SchedulingResult, Process } from '@/types';
import { Calculator } from 'lucide-react';

interface StatisticsProps {
  result: SchedulingResult | null;
}

const Statistics: React.FC<StatisticsProps> = ({ result }) => {
  if (!result) {
    return (
      <Card className="glass-panel w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center">
          <p className="text-muted-foreground">Run the algorithm to see statistics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Average Waiting Time" 
            value={result.avgWaitingTime.toFixed(2)}
            description="Time processes spend waiting in the ready queue"
          />
          <StatCard 
            title="Average Turnaround Time" 
            value={result.avgTurnaroundTime.toFixed(2)}
            description="Total time from arrival to completion"
          />
          <StatCard 
            title="Average Response Time" 
            value={result.avgResponseTime.toFixed(2)}
            description="Time from arrival to first CPU execution"
          />
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Process Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary rounded-md">
                  <th className="p-2 text-left">Process</th>
                  <th className="p-2 text-left">Arrival</th>
                  <th className="p-2 text-left">Burst</th>
                  <th className="p-2 text-left">Completion</th>
                  <th className="p-2 text-left">Turnaround</th>
                  <th className="p-2 text-left">Waiting</th>
                  <th className="p-2 text-left">Response</th>
                </tr>
              </thead>
              <tbody>
                {result.processes.map((process: Process) => (
                  <tr key={process.id} className="border-b border-gray-100 last:border-0">
                    <td className="p-2">
                      <div className={`inline-block w-4 h-4 rounded-full mr-2 ${process.color}`}></div>
                      P{process.id}
                    </td>
                    <td className="p-2">{process.arrival_time}</td>
                    <td className="p-2">{process.burst_time}</td>
                    <td className="p-2">{process.completion_time}</td>
                    <td className="p-2">{process.turnaround_time?.toFixed(2)}</td>
                    <td className="p-2">{process.waiting_time?.toFixed(2)}</td>
                    <td className="p-2">{process.response_time?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-secondary/50 rounded-lg p-4">
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
};

export default Statistics;
