// Santiago clock store for useSyncExternalStore (keeps SSR and client in sync).
const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Santiago",
  hour: "2-digit",
  minute: "2-digit",
});

export function subscribeClock(cb: () => void) {
  const id = setInterval(cb, 10_000);
  return () => clearInterval(id);
}
export const readClock = () => clock.format(new Date());
export const serverClock = () => "--:--";
