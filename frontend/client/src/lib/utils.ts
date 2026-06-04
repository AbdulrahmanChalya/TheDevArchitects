// utils.ts — small shared helpers.
//
// cn() — combine className strings; tailwind-merge resolves conflicts (e.g. p-2 vs p-4).
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
