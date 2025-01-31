export interface TimerCommand {
  command: "start" | "pause" | "resume" | "reset" | "stop";
  duration?: number;
  type?: "countdown" | "stopwatch";
  id?: string;
};

export interface TimerResponse {
  timeString: string;
  id?: string;
  done?: boolean;
};
