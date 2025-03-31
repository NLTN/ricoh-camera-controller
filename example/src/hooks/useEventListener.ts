import EventEmitter from 'events';
import { useEffect } from 'react';

export const useEventListener = (
  emitter: EventEmitter,
  eventName: string | symbol,
  listener: (...args: any[]) => void
) => {
  useEffect(() => {
    // Add the listener
    emitter.on(eventName, listener);

    // Cleanup: Remove the listener
    return () => {
      emitter.off(eventName, listener);
    };
  }, [emitter, eventName, listener]); // Dependencies
};
