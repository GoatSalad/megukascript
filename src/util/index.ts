import { ui } from "../ui"

export function getIterations(period: number): number {
  return (ui.menus[0].tabs[0].get("flash").value as number) / period;
}

export function getVibrationIterations(): number {
  return (ui.menus[0].tabs[0].get("vibrate").value as number) * 2;
}

export function formatWord(word: string): string {
  const format = ["~~", "**", "@@", "``", "^r", "^b"][Math.floor(Math.random() * 6)]
  return `${format}${word}${format}`
}
