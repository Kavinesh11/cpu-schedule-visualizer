
export interface Process {
  id: number;
  arrival_time: number;
  burst_time: number;
  priority: number;
  remaining_time?: number;
  start_time?: number;
  completion_time?: number;
  turnaround_time?: number;
  waiting_time?: number;
  response_time?: number;
  color?: string;
}

export interface GanttItem {
  processId: number | null;
  startTime: number;
  endTime: number;
}

export interface SchedulingResult {
  ganttChart: GanttItem[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  completionTime: number;
  processes: Process[];
}

export type Algorithm = 
  | 'FCFS' 
  | 'SJF (Non-Preemptive)' 
  | 'SJF (Preemptive)' 
  | 'Priority (Non-Preemptive)' 
  | 'Priority (Preemptive)' 
  | 'Round Robin';

export interface VisualizationState {
  currentTime: number;
  runningProcess: Process | null;
  readyQueue: Process[];
  completedProcesses: Process[];
  ganttChart: GanttItem[];
}
