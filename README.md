# slot-timer

_A versatile library for timer functions_

> **Meet all your needs for time keeping in a single place.**<br>
> **It runs on your browser or node environment.**<br>
> **Precise than your browser APIs.**<br>
> **Utilizes web-workers to handle edge cases like tab-switching, browser sleep etc.**<br>
> **Lets you hook into the timer lifecycle events to bespoke your needs.**

### Installation

```js
npm i slot-timer
```

### Usage:

```ts
  import TimerManager, { type TimerInstance } from 'slot-timer';

  //  You just create your timer and pass the options
  const timer: TimerInstance = TimerManager.createTimer({
    duration: 120000, // milliseconds
    type: "stopwatch",
    onTick: (timeString, id, done) => {
      console.log(`Timer ${id}: ${timeString} Done: ${done}`);
    },
    onComplete: (id) => {
      console.log(`Timer ${id} completed!`);
    },
    onError: (error) => {
      console.error(`Timer error: ${error.message}`);
    },
  });

  // Start the timer
  timer.start();

  //  Pause the timer after 10 seconds
  setTimeout(() => {
    timer.pause();
  }, 10000);

  //  Continue the timer after 20 seconds
  setTimeout(() => {
    timer.resume();
  }, 20000);

  // Reset the timer after 30 seconds
  setTimeout(() => {
    timer.reset();
  }, 30000);

  // Stop the timer after 40 seconds
  setTimeout(() => {
    timer.stop();
  }, 40000);
```

Types:
```ts
  interface TimerOptions {
    duration: number; // Duration in milliseconds
    type: "countdown" | "stopwatch"; // Types: countdown(descending), stopwatch(ascending),
    onTick?: (timeString: string, id: string) => void; // Callback listens to every tick of the timer
    onComplete?: (id: string) => void; // Callback function to be called when the timer completes
    onError?: (error: Error) => void; // Callback function to be called when an error occurs
  }

  interface TimerInstance {
    id: string; // Unique identifier for the timer instance
    start: () => void; // Start the timer
    stop: () => void; //  Stop the timer
    pause: () => void; // Pause the timer
    resume: () => void; //  Resume the timer
    reset: () => void; // Reset the timer
  }

  interface WorkerResponse {
    timeString: string; // Time string in the format "HH:MM:SS"
    id: string; // Unique identifier for the timer instance
    done?: boolean; //  Indicates if the timer has completed
  }
```
