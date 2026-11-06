"use client";
import { useSyncExternalStore } from "react";
import { readClock, serverClock, subscribeClock } from "@/utils/santiago-clock";

export function LocalTime() {
  const time = useSyncExternalStore(subscribeClock, readClock, serverClock);
  return (
    <span className="whitespace-nowrap">
      Santiago <time suppressHydrationWarning>{time}</time>
    </span>
  );
}
