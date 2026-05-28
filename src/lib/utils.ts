import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 1) className helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 2) duration (seconds)
export const calculateDuration = (start: string, end: string) => {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, diff / 60000); // menit (float)
};

// speed (km/h)
export const calculateSpeed = (durationMin: number) => {
  const distanceKm = 2;
  const hours = durationMin / 60;

  return durationMin > 0 ? parseFloat((distanceKm / hours).toFixed(2)) : 0;
};