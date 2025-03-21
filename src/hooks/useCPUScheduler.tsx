import { useState, useCallback, useRef } from 'react';
import { Process, GanttItem, SchedulingResult, Algorithm, VisualizationState } from '@/types';
import { toast } from '@/components/ui/use-toast';

// Color palette for processes
const processColors = [
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 
  'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500',
  'bg-teal-500', 'bg-lime-500', 'bg-emerald-500', 'bg-cyan-500',
];

// Hook for CPU scheduling algorithms
export const useCPUScheduler = () => {
  // ... keep existing code for processes, timeQuantum, algorithm states
  const [processes, setProcesses] = useState<Process[]>([]);
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  
  const addProcess = useCallback((process: Omit<Process, 'id' | 'color'>) => {
    const id = processes.length > 0 ? Math.max(...processes.map(p => p.id)) + 1 : 1;
    const colorIndex = (id - 1) % processColors.length;
    
    setProcesses([...processes, {
      id,
      ...process,
      color: processColors[colorIndex],
      remaining_time: process.burst_time
    }]);
  }, [processes]);
  
  // Remove a process
  const removeProcess = useCallback((id: number) => {
    setProcesses(processes.filter(p => p.id !== id));
  }, [processes]);
  
  // Update a process
  const updateProcess = useCallback((updatedProcess: Process) => {
    setProcesses(processes.map(p => 
      p.id === updatedProcess.id ? { ...updatedProcess, remaining_time: updatedProcess.burst_time } : p
    ));
  }, [processes]);

  // Function to reset visualization state
  const resetVisualizationState = () => {
    setVisualizationState({
      currentTime: 0,
      runningProcess: null,
      readyQueue: [],
      completedProcesses: [],
      ganttChart: []
    });
  };

  // Function to skip current visualization
  const skipVisualization = () => {
    skipVisualizationRef.current = true;
  };

  // Generate a deep copy of processes
  const cloneProcesses = (procs: Process[]): Process[] => {
    return procs.map(p => ({...p}));
  };

  // Calculate average time
  const calculateAvgTime = (times: number[]): number => {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < times.length; i++) {
      if (times[i] !== undefined) {
        sum += times[i];
        count++;
      }
    }
    return count > 0 ? sum / count : 0;
  };
  
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<Algorithm>('FCFS');
  const [result, setResult] = useState<SchedulingResult | null>(null);
  const [visualizationSpeed, setVisualizationSpeed] = useState<number>(1000); // ms
  
  // New state for step-by-step visualization
  const [visualizationState, setVisualizationState] = useState<VisualizationState>({
    currentTime: 0,
    runningProcess: null,
    readyQueue: [],
    completedProcesses: [],
    ganttChart: []
  });
  
  const animationFrameRef = useRef<number | null>(null);
  const skipVisualizationRef = useRef<boolean>(false);

  // FCFS Algorithm
  const runFCFS = async (): Promise<SchedulingResult> => {
    const workingProcesses = cloneProcesses(processes)
      .sort((a, b) => a.arrival_time - b.arrival_time);
    
    let currentTime = 0;
    const ganttChart: GanttItem[] = [];
    const completionTimes: number[] = [];
    const turnaroundTimes: number[] = [];
    const waitingTimes: number[] = [];
    const responseTimes: number[] = [];
    
    const completedProcesses: Process[] = [];
    
    for (let i = 0; i < workingProcesses.length; i++) {
      if (skipVisualizationRef.current) {
        // Skip the visualization and calculate final result
        break;
      }
      
      const process = workingProcesses[i];
      
      // If there's a gap between current time and process arrival
      if (currentTime < process.arrival_time) {
        ganttChart.push({
          processId: null,
          startTime: currentTime,
          endTime: process.arrival_time
        });
        
        // Update visualization state for idle time
        setVisualizationState({
          currentTime,
          runningProcess: null,
          readyQueue: workingProcesses.filter(p => 
            p.arrival_time <= process.arrival_time && 
            !completedProcesses.includes(p)
          ).slice(i),
          completedProcesses: [...completedProcesses],
          ganttChart: [...ganttChart]
        });
        
        if (isPaused) {
          await new Promise<void>(resolve => {
            const checkPause = () => {
              if (!isPaused || skipVisualizationRef.current) {
                resolve();
              } else {
                animationFrameRef.current = requestAnimationFrame(checkPause);
              }
            };
            checkPause();
          });
        }
        
        currentTime = process.arrival_time;
        await new Promise(resolve => setTimeout(resolve, visualizationSpeed));
      }
      
      // Process execution
      const startTime = currentTime;
      process.start_time = startTime;
      process.response_time = startTime - process.arrival_time;
      responseTimes[process.id] = process.response_time;
      
      // Create a ready queue of processes that have arrived but not yet executed
      const readyQueue = workingProcesses
        .filter(p => p.arrival_time <= currentTime && !completedProcesses.includes(p) && p.id !== process.id);
      
      // Update visualization state before processing
      setVisualizationState({
        currentTime,
        runningProcess: process,
        readyQueue,
        completedProcesses: [...completedProcesses],
        ganttChart: [...ganttChart]
      });
      
      if (isPaused) {
        await new Promise<void>(resolve => {
          const checkPause = () => {
            if (!isPaused || skipVisualizationRef.current) {
              resolve();
            } else {
              animationFrameRef.current = requestAnimationFrame(checkPause);
            }
          };
          checkPause();
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, visualizationSpeed));
      
      currentTime += process.burst_time;
      
      process.completion_time = currentTime;
      completionTimes[process.id] = currentTime;
      
      process.turnaround_time = process.completion_time - process.arrival_time;
      turnaroundTimes[process.id] = process.turnaround_time;
      
      process.waiting_time = process.turnaround_time - process.burst_time;
      waitingTimes[process.id] = process.waiting_time;
      
      ganttChart.push({
        processId: process.id,
        startTime: startTime,
        endTime: currentTime
      });
      
      completedProcesses.push(process);
      
      // Update visualization state after processing
      setVisualizationState({
        currentTime,
        runningProcess: null,
        readyQueue: workingProcesses
          .filter(p => p.arrival_time <= currentTime && !completedProcesses.includes(p)),
        completedProcesses: [...completedProcesses],
        ganttChart: [...ganttChart]
      });
      
      await new Promise(resolve => setTimeout(resolve, visualizationSpeed / 2));
    }
    
    // If we skipped visualization, calculate the full result without delays
    if (skipVisualizationRef.current) {
      skipVisualizationRef.current = false;
      
      // Quickly finish calculating all processes without visualization
      for (let i = 0; i < workingProcesses.length; i++) {
        const process = workingProcesses[i];
        if (!completedProcesses.includes(process)) {
          // If there's a gap between current time and process arrival
          if (currentTime < process.arrival_time) {
            ganttChart.push({
              processId: null,
              startTime: currentTime,
              endTime: process.arrival_time
            });
            currentTime = process.arrival_time;
          }
          
          // Process execution
          const startTime = currentTime;
          process.start_time = startTime;
          process.response_time = startTime - process.arrival_time;
          responseTimes[process.id] = process.response_time;
          
          currentTime += process.burst_time;
          
          process.completion_time = currentTime;
          completionTimes[process.id] = currentTime;
          
          process.turnaround_time = process.completion_time - process.arrival_time;
          turnaroundTimes[process.id] = process.turnaround_time;
          
          process.waiting_time = process.turnaround_time - process.burst_time;
          waitingTimes[process.id] = process.waiting_time;
          
          ganttChart.push({
            processId: process.id,
            startTime: startTime,
            endTime: currentTime
          });
          
          completedProcesses.push(process);
        }
      }
      
      // Update final visualization state
      setVisualizationState({
        currentTime,
        runningProcess: null,
        readyQueue: [],
        completedProcesses,
        ganttChart
      });
    }
    
    const result: SchedulingResult = {
      ganttChart,
      avgWaitingTime: calculateAvgTime(waitingTimes),
      avgTurnaroundTime: calculateAvgTime(turnaroundTimes),
      avgResponseTime: calculateAvgTime(responseTimes),
      completionTime: currentTime,
      processes: workingProcesses
    };
    
    return result;
  };

  // Other algorithm implementations would follow similar pattern
  // ... keep existing code for other algorithm implementations, updating them to use visualization state
  // SJF Non-Preemptive Algorithm
  const runSJFNonPreemptive = async (): Promise<SchedulingResult> => {
    const workingProcesses = cloneProcesses(processes);
    
    let currentTime = 0;
    const ganttChart: GanttItem[] = [];
    const completionTimes: number[] = [];
    const turnaroundTimes: number[] = [];
    const waitingTimes: number[] = [];
    const responseTimes: number[] = [];
    
    // For visualization
    let visualizationSteps = [];
    
    // Sort by arrival time initially
    workingProcesses.sort((a, b) => a.arrival_time - b.arrival_time);
    
    let remainingProcesses = [...workingProcesses];
    
    while (remainingProcesses.length > 0) {
      // Find processes that have arrived by current time
      const availableProcesses = remainingProcesses.filter(p => p.arrival_time <= currentTime);
      
      // If no process is available, move time to next arrival
      if (availableProcesses.length === 0) {
        const nextArrival = Math.min(...remainingProcesses.map(p => p.arrival_time));
        ganttChart.push({
          processId: null,
          startTime: currentTime,
          endTime: nextArrival
        });
        currentTime = nextArrival;
        continue;
      }
      
      // Find the process with shortest burst time
      const shortestJob = availableProcesses.reduce((prev, curr) => 
        prev.burst_time < curr.burst_time ? prev : curr
      );
      
      // Process execution
      const startTime = currentTime;
      shortestJob.start_time = startTime;
      shortestJob.response_time = startTime - shortestJob.arrival_time;
      responseTimes[shortestJob.id] = shortestJob.response_time;
      
      currentTime += shortestJob.burst_time;
      
      shortestJob.completion_time = currentTime;
      completionTimes[shortestJob.id] = currentTime;
      
      shortestJob.turnaround_time = shortestJob.completion_time - shortestJob.arrival_time;
      turnaroundTimes[shortestJob.id] = shortestJob.turnaround_time;
      
      shortestJob.waiting_time = shortestJob.turnaround_time - shortestJob.burst_time;
      waitingTimes[shortestJob.id] = shortestJob.waiting_time;
      
      ganttChart.push({
        processId: shortestJob.id,
        startTime: startTime,
        endTime: currentTime
      });
      
      // Remove the executed process from remaining processes
      remainingProcesses = remainingProcesses.filter(p => p.id !== shortestJob.id);
    }
    
    const result: SchedulingResult = {
      ganttChart,
      avgWaitingTime: calculateAvgTime(waitingTimes),
      avgTurnaroundTime: calculateAvgTime(turnaroundTimes),
      avgResponseTime: calculateAvgTime(responseTimes),
      completionTime: currentTime,
      processes: workingProcesses
    };
    
    return result;
  };

  // SJF Preemptive (SRTF) Algorithm
  const runSJFPreemptive = async (): Promise<SchedulingResult> => {
    const workingProcesses = cloneProcesses(processes);
    
    let currentTime = 0;
    const ganttChart: GanttItem[] = [];
    const completionTimes: number[] = new Array(workingProcesses.length + 1);
    const turnaroundTimes: number[] = new Array(workingProcesses.length + 1);
    const waitingTimes: number[] = new Array(workingProcesses.length + 1);
    const responseTimes: number[] = new Array(workingProcesses.length + 1);
    const firstResponseRecorded: Set<number> = new Set();
    
    // Initialize remaining time for each process
    workingProcesses.forEach(p => {
      p.remaining_time = p.burst_time;
    });
    
    // Sort by arrival time initially
    workingProcesses.sort((a, b) => a.arrival_time - b.arrival_time);
    
    let remainingProcesses = [...workingProcesses];
    let prevRunningId: number | null = null;
    
    // For visualization
    let visualizationSteps = [];
    
    // Continue until all processes are completed
    while (remainingProcesses.length > 0) {
      // Find processes that have arrived by current time
      const availableProcesses = remainingProcesses.filter(p => p.arrival_time <= currentTime);
      
      // If no process is available, move time to next arrival
      if (availableProcesses.length === 0) {
        const nextArrival = Math.min(...remainingProcesses.map(p => p.arrival_time));
        
        // Add idle time to Gantt chart
        if (prevRunningId !== null) {
          ganttChart.push({
            processId: prevRunningId,
            startTime: ganttChart[ganttChart.length - 1].endTime,
            endTime: currentTime
          });
          prevRunningId = null;
        }
        
        ganttChart.push({
          processId: null,
          startTime: currentTime,
          endTime: nextArrival
        });
        
        currentTime = nextArrival;
        continue;
      }
      
      // Find the process with shortest remaining time
      const shortestJob = availableProcesses.reduce((prev, curr) => 
        (prev.remaining_time || Infinity) < (curr.remaining_time || Infinity) ? prev : curr
      );
      
      // Record response time if this is the first time the process runs
      if (!firstResponseRecorded.has(shortestJob.id)) {
        shortestJob.response_time = currentTime - shortestJob.arrival_time;
        responseTimes[shortestJob.id] = shortestJob.response_time;
        firstResponseRecorded.add(shortestJob.id);
      }
      
      // Determine how long this process will run
      // Either until it completes or until a new process arrives
      let runUntil = currentTime + (shortestJob.remaining_time || 0);
      
      // Check if any new process arrives before this one completes
      const nextArrival = remainingProcesses
        .filter(p => p.arrival_time > currentTime)
        .reduce((min, p) => Math.min(min, p.arrival_time), Infinity);
      
      if (nextArrival < runUntil) {
        runUntil = nextArrival;
      }
      
      // Calculate how much time the process runs in this iteration
      const timeRun = runUntil - currentTime;
      
      // If the running process changed, add to Gantt chart
      if (prevRunningId !== shortestJob.id) {
        if (prevRunningId !== null) {
          ganttChart.push({
            processId: prevRunningId,
            startTime: ganttChart[ganttChart.length - 1].endTime,
            endTime: currentTime
          });
        }
        
        ganttChart.push({
          processId: shortestJob.id,
          startTime: currentTime,
          endTime: currentTime // Will update the end time when the process changes
        });
        
        prevRunningId = shortestJob.id;
      }
      
      // Update remaining time
      shortestJob.remaining_time = (shortestJob.remaining_time || 0) - timeRun;
      currentTime = runUntil;
      
      // If the process is completed
      if (shortestJob.remaining_time === 0) {
        shortestJob.completion_time = currentTime;
        completionTimes[shortestJob.id] = currentTime;
        
        shortestJob.turnaround_time = shortestJob.completion_time - shortestJob.arrival_time;
        turnaroundTimes[shortestJob.id] = shortestJob.turnaround_time;
        
        shortestJob.waiting_time = shortestJob.turnaround_time - shortestJob.burst_time;
        waitingTimes[shortestJob.id] = shortestJob.waiting_time;
        
        // Remove the completed process
        remainingProcesses = remainingProcesses.filter(p => p.id !== shortestJob.id);
        prevRunningId = null;
      }
    }
    
    // Update the end time of the last Gantt chart item
    if (ganttChart.length > 0) {
      ganttChart[ganttChart.length - 1].endTime = currentTime;
    }
    
    const result: SchedulingResult = {
      ganttChart,
      avgWaitingTime: calculateAvgTime(waitingTimes),
      avgTurnaroundTime: calculateAvgTime(turnaroundTimes),
      avgResponseTime: calculateAvgTime(responseTimes),
      completionTime: currentTime,
      processes: workingProcesses
    };
    
    return result;
  };

  // Priority Non-Preemptive Algorithm
  const runPriorityNonPreemptive = async (): Promise<SchedulingResult> => {
    const workingProcesses = cloneProcesses(processes);
    
    let currentTime = 0;
    const ganttChart: GanttItem[] = [];
    const completionTimes: number[] = [];
    const turnaroundTimes: number[] = [];
    const waitingTimes: number[] = [];
    const responseTimes: number[] = [];
    
    // For visualization
    let visualizationSteps = [];
    
    // Sort by arrival time initially
    workingProcesses.sort((a, b) => a.arrival_time - b.arrival_time);
    
    let remainingProcesses = [...workingProcesses];
    
    while (remainingProcesses.length > 0) {
      // Find processes that have arrived by current time
      const availableProcesses = remainingProcesses.filter(p => p.arrival_time <= currentTime);
      
      // If no process is available, move time to next arrival
      if (availableProcesses.length === 0) {
        const nextArrival = Math.min(...remainingProcesses.map(p => p.arrival_time));
        ganttChart.push({
          processId: null,
          startTime: currentTime,
          endTime: nextArrival
        });
        currentTime = nextArrival;
        continue;
      }
      
      // Find the process with highest priority (lower number = higher priority)
      const highestPriorityProcess = availableProcesses.reduce((prev, curr) => 
        prev.priority < curr.priority ? prev : curr
      );
      
      // Process execution
      const startTime = currentTime;
      highestPriorityProcess.start_time = startTime;
      highestPriorityProcess.response_time = startTime - highestPriorityProcess.arrival_time;
      responseTimes[highestPriorityProcess.id] = highestPriorityProcess.response_time;
      
      currentTime += highestPriorityProcess.burst_time;
      
      highestPriorityProcess.completion_time = currentTime;
      completionTimes[highestPriorityProcess.id] = currentTime;
      
      highestPriorityProcess.turnaround_time = highestPriorityProcess.completion_time - highestPriorityProcess.arrival_time;
      turnaroundTimes[highestPriorityProcess.id] = highestPriorityProcess.turnaround_time;
      
      highestPriorityProcess.waiting_time = highestPriorityProcess.turnaround_time - highestPriorityProcess.burst_time;
      waitingTimes[highestPriorityProcess.id] = highestPriorityProcess.waiting_time;
      
      ganttChart.push({
        processId: highestPriorityProcess.id,
        startTime: startTime,
        endTime: currentTime
      });
      
      // Remove the executed process from remaining processes
      remainingProcesses = remainingProcesses.filter(p => p.id !== highestPriorityProcess.id);
    }
    
    const result: SchedulingResult = {
      ganttChart,
      avgWaitingTime: calculateAvgTime(waitingTimes),
      avgTurnaroundTime: calculateAvgTime(turnaroundTimes),
      avgResponseTime: calculateAvgTime(responseTimes),
      completionTime: currentTime,
      processes: workingProcesses
    };
    
    return result;
  };

  // Priority Preemptive Algorithm
  const runPriorityPreemptive = async (): Promise<SchedulingResult> => {
    const workingProcesses = cloneProcesses(processes);
    
    let currentTime = 0;
    const ganttChart: GanttItem[] = [];
    const completionTimes: number[] = new Array(workingProcesses.length + 1);
    const turnaroundTimes: number[] = new Array(workingProcesses.length + 1);
    const waitingTimes: number[] = new Array(workingProcesses.length + 1);
    const responseTimes: number[] = new Array(workingProcesses.length + 1);
    const firstResponseRecorded: Set<number> = new Set();
    
    // Initialize remaining time for each process
    workingProcesses.forEach(p => {
      p.remaining_time = p.burst_time;
    });
    
    // Sort by arrival time initially
    workingProcesses.sort((a, b) => a.arrival_time - b.arrival_time);
    
    let remainingProcesses = [...workingProcesses];
    let prevRunningId: number | null = null;
    
    // For visualization
    let visualizationSteps = [];
    
    // Continue until all processes are completed
    while (remainingProcesses.length > 0) {
      // Find processes that have arrived by current time
      const availableProcesses = remainingProcesses.filter(p => p.arrival_time <= currentTime);
      
      // If no process is available, move time to next arrival
      if (availableProcesses.length === 0) {
        const nextArrival = Math.min(...remainingProcesses.map(p => p.arrival_time));
        
        // Add idle time to Gantt chart
        if (prevRunningId !== null) {
          ganttChart.push({
            processId: prevRunningId,
            startTime: ganttChart[ganttChart.length - 1].endTime,
            endTime: currentTime
          });
          prevRunningId = null;
        }
        
        ganttChart.push({
          processId: null,
          startTime: currentTime,
          endTime: nextArrival
        });
        
        currentTime = nextArrival;
        continue;
      }
      
      // Find the process with highest priority (lowest number)
      const highestPriorityProcess = availableProcesses.reduce((prev, curr) => 
        prev.priority < curr.priority ? prev : curr
      );
      
      // Record response time if this is the first time the process runs
      if (!firstResponseRecorded.has(highestPriorityProcess.id)) {
        highestPriorityProcess.response_time = currentTime - highestPriorityProcess.arrival_time;
        responseTimes[highestPriorityProcess.id] = highestPriorityProcess.response_time;
        firstResponseRecorded.add(highestPriorityProcess.id);
      }
      
      // Determine how long this process will run
      // It could be interrupted by a new arrival or when it completes
      let runUntil = currentTime + (highestPriorityProcess.remaining_time || 0);
      
      // Check if any new process arrives before this one completes
      const nextArrival = remainingProcesses
        .filter(p => p.arrival_time > currentTime)
        .reduce((min, p) => Math.min(min, p.arrival_time), Infinity);
      
      if (nextArrival < runUntil) {
        runUntil = nextArrival;
      }
      
      // Calculate how much time the process runs in this iteration
      const timeRun = runUntil - currentTime;
      
      // If the running process changed, add to Gantt chart
      if (prevRunningId !== highestPriorityProcess.id) {
        if (prevRunningId !== null) {
          ganttChart.push({
            processId: prevRunningId,
            startTime: ganttChart[ganttChart.length - 1].endTime,
            endTime: currentTime
          });
        }
        
        ganttChart.push({
          processId: highestPriorityProcess.id,
          startTime: currentTime,
          endTime: currentTime // Will update the end time when the process changes
        });
        
        prevRunningId = highestPriorityProcess.id;
      }
      
      // Update remaining time
      highestPriorityProcess.remaining_time = (highestPriorityProcess.remaining_time || 0) - timeRun;
      currentTime = runUntil;
      
      // If the process is completed
      if (highestPriorityProcess.remaining_time === 0) {
        highestPriorityProcess.completion_time = currentTime;
        completionTimes[highestPriorityProcess.id] = currentTime;
        
        highestPriorityProcess.turnaround_time = highestPriorityProcess.completion_time - highestPriorityProcess.arrival_time;
        turnaroundTimes[highestPriorityProcess.id] = highestPriorityProcess.turnaround_time;
        
        highestPriorityProcess.waiting_time = highestPriorityProcess.turnaround_time - highestPriorityProcess.burst_time;
        waitingTimes[highestPriorityProcess.id] = highestPriorityProcess.waiting_time;
        
        // Remove the completed process
        remainingProcesses = remainingProcesses.filter(p => p.id !== highestPriorityProcess.id);
        prevRunningId = null;
      }
    }
    
    // Update the end time of the last Gantt chart item
    if (ganttChart.length > 0) {
      ganttChart[ganttChart.length - 1].endTime = currentTime;
    }
    
    const result: SchedulingResult = {
      ganttChart,
      avgWaitingTime: calculateAvgTime(waitingTimes),
      avgTurnaroundTime: calculateAvgTime(turnaroundTimes),
      avgResponseTime: calculateAvgTime(responseTimes),
      completionTime: currentTime,
      processes: workingProcesses
    };
    
    return result;
  };

  // Round Robin Algorithm
  const runRoundRobin = async (): Promise<SchedulingResult> => {
    const workingProcesses = cloneProcesses(processes);
    
    // Initialize remaining time for each process
    workingProcesses.forEach(p => {
      p.remaining_time = p.burst_time;
    });
    
    let currentTime = 0;
    const ganttChart: GanttItem[] = [];
    const completionTimes: number[] = new Array(workingProcesses.length + 1);
    const turnaroundTimes: number[] = new Array(workingProcesses.length + 1);
    const waitingTimes: number[] = new Array(workingProcesses.length + 1);
    const responseTimes: number[] = new Array(workingProcesses.length + 1);
    const firstResponseRecorded: Set<number> = new Set();
    
    // Sort processes by arrival time
    workingProcesses.sort((a, b) => a.arrival_time - b.arrival_time);
    
    // Create a queue for ready processes
    let readyQueue: Process[] = [];
    let remainingProcesses = [...workingProcesses];
    
    // For visualization
    let visualizationSteps = [];
    
    // Continue until all processes are completed
    while (remainingProcesses.length > 0 || readyQueue.length > 0) {
      // Add newly arrived processes to the ready queue
      const newArrivals = remainingProcesses.filter(p => p.arrival_time <= currentTime);
      readyQueue.push(...newArrivals);
      remainingProcesses = remainingProcesses.filter(p => p.arrival_time > currentTime);
      
      // If ready queue is empty but there are still processes to arrive
      if (readyQueue.length === 0 && remainingProcesses.length > 0) {
        const nextArrival = Math.min(...remainingProcesses.map(p => p.arrival_time));
        ganttChart.push({
          processId: null,
          startTime: currentTime,
          endTime: nextArrival
        });
        currentTime = nextArrival;
        continue;
      }
      
      // Get the next process from the ready queue
      if (readyQueue.length === 0) break;
      
      const currentProcess = readyQueue.shift()!;
      
      // Record response time if this is the first time the process runs
      if (!firstResponseRecorded.has(currentProcess.id)) {
        currentProcess.response_time = currentTime - currentProcess.arrival_time;
        responseTimes[currentProcess.id] = currentProcess.response_time;
        firstResponseRecorded.add(currentProcess.id);
      }
      
      // Calculate execution time in this time quantum
      const executionTime = Math.min(timeQuantum, currentProcess.remaining_time || 0);
      const startTime = currentTime;
      currentTime += executionTime;
      
      // Update the process remaining time
      currentProcess.remaining_time = (currentProcess.remaining_time || 0) - executionTime;
      
      // Add to Gantt chart
      ganttChart.push({
        processId: currentProcess.id,
        startTime: startTime,
        endTime: currentTime
      });
      
      // Check for newly arrived processes during this time quantum
      const arrivedDuringExecution = remainingProcesses.filter(p => 
        p.arrival_time > startTime && p.arrival_time <= currentTime
      );
      
      // Add them to the ready queue
      readyQueue.push(...arrivedDuringExecution);
      remainingProcesses = remainingProcesses.filter(p => 
        p.arrival_time > currentTime
      );
      
      // If the process has completed execution
      if (currentProcess.remaining_time === 0) {
        currentProcess.completion_time = currentTime;
        completionTimes[currentProcess.id] = currentTime;
        
        currentProcess.turnaround_time = currentProcess.completion_time - currentProcess.arrival_time;
        turnaroundTimes[currentProcess.id] = currentProcess.turnaround_time;
        
        currentProcess.waiting_time = currentProcess.turnaround_time - currentProcess.burst_time;
        waitingTimes[currentProcess.id] = currentProcess.waiting_time;
      } else {
        // If the process is not completed, add it back to the ready queue
        readyQueue.push(currentProcess);
      }
    }
    
    const result: SchedulingResult = {
      ganttChart,
      avgWaitingTime: calculateAvgTime(waitingTimes),
      avgTurnaroundTime: calculateAvgTime(turnaroundTimes),
      avgResponseTime: calculateAvgTime(responseTimes),
      completionTime: currentTime,
      processes: workingProcesses
    };
    
    return result;
  };

  // Run the selected scheduling algorithm
  const runSchedulingAlgorithm = async () => {
    if (processes.length === 0) {
      toast({
        title: "No processes",
        description: "Please add at least one process before running the scheduler.",
        variant: "destructive"
      });
      return;
    }
    
    setIsRunning(true);
    resetVisualizationState();
    skipVisualizationRef.current = false;
    
    try {
      let result;
      
      switch (currentAlgorithm) {
        case 'FCFS':
          result = await runFCFS();
          break;
        case 'SJF (Non-Preemptive)':
          result = await runSJFNonPreemptive();
          break;
        case 'SJF (Preemptive)':
          result = await runSJFPreemptive();
          break;
        case 'Priority (Non-Preemptive)':
          result = await runPriorityNonPreemptive();
          break;
        case 'Priority (Preemptive)':
          result = await runPriorityPreemptive();
          break;
        case 'Round Robin':
          result = await runRoundRobin();
          break;
        default:
          result = await runFCFS();
      }
      
      setResult(result);
      
      toast({
        title: "Scheduling Complete",
        description: `${currentAlgorithm} algorithm execution finished.`,
      });
    } catch (error) {
      console.error("Error running scheduler:", error);
      toast({
        title: "Error",
        description: "An error occurred while running the scheduler.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setIsPaused(false);
    }
  };

  // Clean up animation frames on unmount
  const cleanupAnimations = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  return {
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
  };
};

