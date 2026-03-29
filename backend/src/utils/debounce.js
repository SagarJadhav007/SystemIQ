const timers = {};

/**
 * Debounce a function call by key.
 * Key can be anything — socket.id for voice, socket.id+"_graph" for graph updates.
 * This way voice and graph debounces don't cancel each other.
 */
export function debounceTrigger(key, fn, delay = 2800) {
  if (timers[key]) {
    clearTimeout(timers[key]);
  }

  timers[key] = setTimeout(() => {
    delete timers[key];
    fn();
  }, delay);
}

export function cancelDebounce(key) {
  if (timers[key]) {
    clearTimeout(timers[key]);
    delete timers[key];
  }
}