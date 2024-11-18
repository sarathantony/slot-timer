// Tracker
let count = 0;
// Explicitly typed as number | null
let intervalId: number | null = null;
// Variable to hold the unique ID
let workerId: string | null = null;

/**
 * startInterval: Function to start the interval
 */
function startInterval() {
  if (intervalId === null) {
    intervalId = self.setInterval(() => {
      count += 1;
      // Send the count and the unique id back to the main thread
      self.postMessage({ id: workerId, count });
    }, 1000) as unknown as number; // Cast to number
  }
}

/**
 * self: Window & typeof globalThis
 * @param event [MessageEvent]
 */
self.onmessage = (event: MessageEvent) => {
  const { command, id } = event.data;

  switch (command) {
    case "start":
      workerId = id; // Set the unique ID for this worker instance
      count = 0;
      startInterval();

      break;

    case "pause":
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }

      break;

    case "continue":
      startInterval();

      break;

    case "reset":
      count = 0;
      self.postMessage({ id: workerId, count }); // Send reset count immediately
      startInterval();

      break;

    default:
      // Send an error message back to the main thread for handling
      self.postMessage({ error: `Unknown command: ${command}` });

      break;
  }
};
