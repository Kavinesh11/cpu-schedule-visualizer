
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SchedulingResult } from '@/types';
import { BarChart, PieChart, Cell, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Pie, Legend } from 'recharts';
import { LineChart, TrendingUp } from 'lucide-react';

interface StatisticsProps {
  result: SchedulingResult | null;
}

const Statistics: React.FC<StatisticsProps> = ({ result }) => {
  if (!result) {
    return (
      <Card className="glass-panel w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Run a scheduling algorithm to see the performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="h-40 flex items-center justify-center bg-secondary/10 rounded-lg my-2">
          <div className="text-muted-foreground text-center flex flex-col items-center">
            <TrendingUp className="h-10 w-10 mb-2 text-muted-foreground/50" />
            <p>No data available yet. Start a scheduling algorithm to analyze the metrics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { avgWaitingTime, avgTurnaroundTime, avgResponseTime, completionTime, processes } = result;

  // Convert the statistics into data for the bar chart
  const barData = [
    { name: 'Avg. Waiting Time', value: avgWaitingTime },
    { name: 'Avg. Turnaround Time', value: avgTurnaroundTime },
    { name: 'Avg. Response Time', value: avgResponseTime }
  ];

  // Process-specific data for individual metrics
  const processData = processes.map(p => ({
    id: p.id,
    name: `P${p.id}`,
    waitingTime: p.waiting_time || 0,
    turnaroundTime: p.turnaround_time || 0,
    responseTime: p.response_time || 0,
    burstTime: p.burst_time
  }));

  // Calculate CPU utilization
  const totalIdleTime = result.ganttChart
    .filter(item => item.processId === null)
    .reduce((sum, item) => sum + (item.endTime - item.startTime), 0);
  
  const cpuUtilization = ((completionTime - totalIdleTime) / completionTime) * 100;
  const throughput = processes.length / completionTime;

  // Data for the pie chart
  const pieData = [
    { name: 'CPU Utilization', value: cpuUtilization },
    { name: 'CPU Idle', value: 100 - cpuUtilization }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Custom tooltip formatter that handles the different value types
  const customTooltipFormatter = (value: any) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  return (
    <Card className="glass-panel w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <LineChart className="h-5 w-5 text-primary" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Analyzing algorithm efficiency and process statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/50">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Avg. Waiting Time</div>
              <div className="text-2xl font-bold mt-1">{avgWaitingTime.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Time processes spend waiting in the queue</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Avg. Turnaround Time</div>
              <div className="text-2xl font-bold mt-1">{avgTurnaroundTime.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Total time from arrival to completion</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Avg. Response Time</div>
              <div className="text-2xl font-bold mt-1">{avgResponseTime.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Time until first CPU response</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">CPU Utilization</div>
              <div className="text-2xl font-bold mt-1">{cpuUtilization.toFixed(2)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Throughput: {throughput.toFixed(4)} proc/unit</div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Average Times Bar Chart */}
          <div className="h-80 bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium mb-2">Time Metrics Comparison</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={barData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip formatter={customTooltipFormatter} />
                <Bar dataKey="value" fill="#8884d8">
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CPU Utilization Pie Chart */}
          <div className="h-80 bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium mb-2">CPU Utilization</h3>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4ade80' : '#d1d5db'} />
                  ))}
                </Pie>
                <Tooltip formatter={customTooltipFormatter} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Process-specific metrics table */}
        <div>
          <h3 className="text-sm font-medium mb-3">Process-Specific Metrics</h3>
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Process
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Burst Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waiting Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turnaround Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {processData.map((process) => (
                  <tr key={process.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {process.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {process.burstTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {process.waitingTime.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {process.turnaroundTime.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {process.responseTime.toFixed(2)}
                    </td>
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

export default Statistics;
