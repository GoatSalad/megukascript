const splitPath = window.location.pathname.split("/")
export const url = window.location.href,
  protocol = window.location.protocol,
  host = window.location.hostname,
  path = window.location.pathname,
  boards = window.boards,
  board = splitPath[1],
  catalog = splitPath[2] === "catalog",
  thread = parseInt(splitPath[2]) || 0,
  last100 = url.match(/last\=([0-9]+)/) ? true : false

export function initCommon() {
  if (!boards) {
    throw new Error("megukascript: Invalid boards variable, stopping")
  }

  boards.push("all")

  if (!boards.includes(board)) {
    throw new Error("megukascript: Invalid board, stopping")
  }
}
