import { ui } from "../ui"

export function getIterations(period: number): number {
  const flash = ui.menus[0].tabs[0].get("flash").value as number

  if (flash === Infinity) {
    return 60 / period;
  }

  return flash / period;
}

export function getVibrationIterations(): number {
  const vibrate = ui.menus[0].tabs[0].get("vibrate").value as number

  if (vibrate === Infinity) {
    return 120;
  }

  return vibrate * 2;
}

export function formatWord(word: string): string {
  const format = ["~~", "**", "@@", "``", "^r", "^b"][Math.floor(Math.random() * 6)]
  return `${format}${word}${format}`
}
