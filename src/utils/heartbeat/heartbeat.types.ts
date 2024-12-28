export type TimerType = "countdown" | "stopwatch";

export interface TimerOptions {
    duration: number; // Duration in milliseconds
    type: TimerType; // "countdown" or "stopwatch"
    onTick: (timeString: string, id: string) => void; // Callback with formatted time string
    onComplete?: (id: string) => void; // Optional callback when the timer ends
}

export interface TimerInstance {
    id: string;
    stop: () => void;
}