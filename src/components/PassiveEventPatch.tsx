"use client";

import { useEffect } from "react";

/**
 * Patches addEventListener globally so that touch events (touchmove, touchstart)
 * are always registered as passive. This eliminates the browser warning:
 * "Added non-passive event listener to a scroll-blocking 'touchmove' event."
 *
 * FullCalendar's interactionPlugin registers these without passive:true.
 */
export function PassiveEventPatch() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      if (type === "touchmove" || type === "touchstart") {
        if (typeof options === "boolean") {
          options = { capture: options, passive: true };
        } else if (options === undefined || options === null) {
          options = { passive: true };
        } else {
          options = { ...options, passive: true };
        }
      }
      return originalAddEventListener.call(this, type, listener, options);
    };

    return () => {
      // Restore original on unmount (optional cleanup)
      EventTarget.prototype.addEventListener = originalAddEventListener;
    };
  }, []);

  return null;
}
