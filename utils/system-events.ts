// Tiny event bus so the terminal can talk to the system monitor.
export const SYSTEM_ALERT = "system-alert";

export function triggerSystemAlert() {
  window.dispatchEvent(new Event(SYSTEM_ALERT));
}
