
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Cpu, Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import { Algorithm } from '@/types';

interface AlgorithmSelectorProps {
  currentAlgorithm: Algorithm;
  setCurrentAlgorithm: (algorithm: Algorithm) => void;
  timeQuantum: number;
  setTimeQuantum: (time: number) => void;
  onRun: (visualize: boolean) => void;
  isRunning: boolean;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  visualizationSpeed: number;
  setVisualizationSpeed: (speed: number) => void;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  currentAlgorithm,
  setCurrentAlgorithm,
  timeQuantum,
  setTimeQuantum,
  onRun,
  isRunning,
  isPaused,
  setIsPaused,
  visualizationSpeed,
  setVisualizationSpeed
}) => {
  const algorithms: Algorithm[] = [
    'FCFS',
    'SJF (Non-Preemptive)',
    'SJF (Preemptive)',
    'Priority (Non-Preemptive)',
    'Priority (Preemptive)',
    'Round Robin'
  ];

  return (
    <Card className="glass-panel w-full">
      <CardHeader>
        <CardTitle className="text-lg">Algorithm Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Select Algorithm</Label>
          <RadioGroup
            value={currentAlgorithm}
            onValueChange={(value) => setCurrentAlgorithm(value as Algorithm)}
            disabled={isRunning}
            className="grid grid-cols-1 md:grid-cols-2 gap-2"
          >
            {algorithms.map((algorithm) => (
              <div key={algorithm} className="flex items-center space-x-2">
                <RadioGroupItem value={algorithm} id={algorithm} />
                <Label htmlFor={algorithm} className="cursor-pointer">
                  {algorithm}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {currentAlgorithm === 'Round Robin' && (
          <div className="space-y-2">
            <Label htmlFor="time-quantum">Time Quantum</Label>
            <div className="flex space-x-2">
              <Input
                id="time-quantum"
                type="number"
                min="1"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(Number(e.target.value))}
                disabled={isRunning}
                className="bg-white/50"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Visualization Speed</Label>
          <div className="flex space-x-2 items-center">
            <span className="text-sm">Slow</span>
            <Slider
              value={[visualizationSpeed]}
              min={200}
              max={2000}
              step={100}
              onValueChange={(value) => setVisualizationSpeed(value[0])}
              disabled={isRunning && !isPaused}
              className="flex-grow"
            />
            <span className="text-sm">Fast</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onRun(true)}
            disabled={isRunning}
            className="flex-1"
          >
            <Play className="mr-2 h-4 w-4" />
            Visualize
          </Button>
          
          <Button
            onClick={() => onRun(false)}
            disabled={isRunning}
            variant="outline"
            className="flex-1"
          >
            <FastForward className="mr-2 h-4 w-4" />
            Calculate Only
          </Button>
          
          {isRunning && (
            <Button
              onClick={() => setIsPaused(!isPaused)}
              variant="secondary"
              className="flex-1"
            >
              {isPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
          )}
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmSelector;
