const timers = {};

export function debounceTrigger(socketId, fn, delay = 1500) {
  if (timers[socketId]) {
    clearTimeout(timers[socketId]);
  }

  timers[socketId] = setTimeout(() => {
    fn();
  }, delay);
}