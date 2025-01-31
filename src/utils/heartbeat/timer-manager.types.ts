export interface TimerOptions {
  duration: number; // Duration in milliseconds
  type: "countdown" | "stopwatch";
  onTick?: (timeString: string, id: string) => void;
  onComplete?: (id: string) => void;
  onError?: (error: Error) => void;
}

export interface TimerInstance {
  id: string;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export interface WorkerMessage {
  command: "init" | "start" | "stop" | "pause" | "resume" | "reset";
  duration?: number;
  type?: "countdown" | "stopwatch";
  id: string;
};

export interface WorkerResponse {
  timeString: string;
  id: string;
  done?: boolean;
};
