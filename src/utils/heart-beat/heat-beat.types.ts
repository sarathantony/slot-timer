export type TickCallback = (seconds: number, id: string) => void;

export interface TimerProps {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  stop: () => void;
}