import { Tab, tabs } from "./tabs"
import { getIterations, getVibrationIterations } from "../util"

type menu = {
  readonly self: HTMLDivElement
  readonly tabs: Tab[]
}

class UI {
  readonly buttons: HTMLAnchorElement[]
  readonly menus: menu[]

  constructor(ids: string[], titles: string[], icons: string[], before: Element[], callbacks: (() => void)[], menuIds: string[]) {
    if (
      !ids.length ||
      ids.length !== titles.length ||
      ids.length !== icons.length ||
      ids.length !== before.length ||
      ids.length !== callbacks.length ||
      ids.length !== menuIds.length
    ) {
      throw new Error("megukascript: Invalid UI constructor parameters")
    }

    const beforeMenu = document.getElementById("options")

    if (!beforeMenu) {
      throw new Error(`megukascript: Unable to find options menu`)
    }

    this.buttons = new Array()
    this.menus = new Array()

    for (const [index, id] of ids.entries()) {
      const option = before[index].insertAdjacentElement("beforebegin", document.createElement("a")) as HTMLAnchorElement

      if (!option) {
        console.error(`megukascript: Unable to add custom option "${id}"`)
        continue
      }

      option.id = id
      option.title = titles[index]
      option.innerHTML = icons[index]
      option.onclick = callbacks[index]

      for (const c of before[0].classList) {
        option.classList.add(c)
      }

      if (menuIds[index]) {
        const menu = beforeMenu.insertAdjacentElement("beforebegin", document.createElement("div")) as HTMLDivElement

        if (!menu) {
          console.error(`megukascript: Unable to add custom menu "${menuIds[index]}"`)
          continue
        }

        menu.id = menuIds[index]
        menu.style.display = "none"

        for (const c of beforeMenu.classList) {
          menu.classList.add(c)
        }

        for (const opt of option.parentElement.getElementsByTagName("a")) {
          if (opt.id !== id) {
            opt.addEventListener("click", () => menu.style.display = "none")
          }
        }

        this.populateTabs(menu)
      }

      this.buttons.push(option)
    }
  }

  private async populateTabs(parent: HTMLDivElement) {
    const generated: Tab[] = new Array(),
      header = parent.appendChild(document.createElement("div")),
      content = parent.appendChild(document.createElement("div"))
    parent.insertBefore(document.createElement("hr"), content)

    for (const [ index, tab ] of tabs.entries()) {
      generated.push(new Tab(index, header, content, tab[0], tab[1], tab[2]))
    }

    this.menus.push({ self: parent, tabs: generated })
  }
}

export var ui: UI

export async function initUI() {
  const before = document.getElementById("banner-options")

  if (!before) {
    throw new Error("megukascript: Unable to find banner options button")
  }

  ui = new UI(
    [ /*"toggle-music-player-megukascript", */"banner-megukascript-options" ],
    [ /*"Toggle MMP visibility", */"Megukascript Options" ],
    [
      /*'<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M 21 0 L 8 4.625 C 7.449219 4.808594 7 5.417969 7 5.96875 L 7 17.78125 C 6.546875 17.707031 6.035156 17.714844 5.5 17.84375 C 3.566406 18.316406 2 20.0625 2 21.71875 C 2 23.375 3.566406 24.316406 5.5 23.84375 C 7.410156 23.378906 8.960938 21.699219 9 20.0625 C 9 20.042969 9 20.019531 9 20 L 9 8.28125 L 20 4.34375 L 20 14.78125 C 19.546875 14.707031 19.035156 14.714844 18.5 14.84375 C 16.566406 15.316406 15 17.0625 15 18.71875 C 15 20.375 16.566406 21.316406 18.5 20.84375 C 20.433594 20.371094 22 18.65625 22 17 L 22 1 C 22 0.449219 21.550781 0 21 0 Z"></path></svg>',*/
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M2 15s0-6 6-6c4 0 4.5 3.5 7.5 3.5 4 0 4-3.5 4-3.5H22s0 6-6 6c-4 0-5.5-3.5-7.5-3.5-4 0-4 3.5-4 3.5H2"/></svg>'
    ],
    [ /*before, */before ],
    [
      /*() => ui.menus[0].tabs[3].get("show").self.getElementsByTagName("input")[0].click(),*/
      () => {
        for (const modal of ui.menus[0].self.parentElement.children) {
          if (modal.id !== "megukascript-options" && modal.id !== "moderation-panel" && modal.id !== "megu-tv") {
            (modal as HTMLElement).style.display = "none"
          }
        }

        ui.menus[0].self.style.display = ui.menus[0].self.style.display === "none" ? "block" : "none"
      }
    ],
    [ /*undefined, */"megukascript-options" ]
  )

  insertCSS()
  //extraConfig()
}

async function insertCSS() {
  const css = document.head.appendChild(document.createElement("style"))
  css.type = "text/css"
  css.innerHTML =
//`.sekrit_text { color: #FFDC91; }
`.lewd_color { animation: lewd_blinker 0.7s linear ${getIterations(0.7)}; color: pink; } @keyframes lewd_blinker { 50% { color: #FFD6E1 } }
.decision_roll { animation: decision_blinker 0.4s linear 2; color: lightgreen; } @keyframes decision_blinker { 50% { color: green } }
.planeptune_wins { animation: planeptune_blinker 0.6s linear ${getIterations(0.6)}; color: mediumpurple; } @keyframes planeptune_blinker { 50% { color: #fff} }
.lastation_wins { animation: lastation_blinker 0.6s linear ${getIterations(0.6)}; color: #000; } @keyframes lastation_blinker { 50% { color: #fff} }
.lowee_wins { animation: lowee_blinker 0.6s linear ${getIterations(0.6)}; color: #e6e6ff; } @keyframes lowee_blinker { 50% { color: #c59681 }}
.leanbox_wins { animation: leanbox_blinker 0.6s linear ${getIterations(0.6)}; color: #4dff4d; } @keyframes leanbox_blinker { 50% { color: #fff} }
.thousand_pyu { animation: pyu_blinker 0.4s linear ${getIterations(0.4)}; color: aqua; } @keyframes pyu_blinker { 50% { color: white } }
.shaking_post { animation: screaming 0.5s linear 0s ${getVibrationIterations()}; } @keyframes screaming { 0% { -webkit-transform: translate(2px, 1px) rotate(0deg); } 10% { -webkit-transform: translate(-1px, -2px) rotate(-1deg); } 20% { -webkit-transform: translate(-3px, 0px) rotate(1deg); } 30% { -webkit-transform: translate(0px, 2px) rotate(0deg); } 40% { -webkit-transform: translate(1px, -1px) rotate(1deg); } 50% { -webkit-transform: translate(-1px, 2px) rotate(-1deg); } 60% { -webkit-transform: translate(-3px, 1px) rotate(0deg); } 70% { -webkit-transform: translate(2px, 1px) rotate(-1deg); } 80% { -webkit-transform: translate(-1px, -1px) rotate(1deg); } 90% { -webkit-transform: translate(2px, 2px) rotate(0deg); } 100% { -webkit-transform: translate(1px, -2px) rotate(-1deg); } }";`
}

/*async function extraConfig() {
  const player = ui.menus[0].tabs[3].get("show").self.getElementsByTagName("input")[0],
    secret = ui.menus[0].tabs[2].get("encode").self.getElementsByTagName("input")[0]

  player.onclick = () => mgcPl_optionClicked
  secret.addEventListener("keyup", (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      (secret.nextElementSibling as HTMLButtonElement).click()
      event.preventDefault()
    }
  })

  secret.addEventListener("paste", (event: ClipboardEvent) => {
    if (event.clipboardData.files.length === 1) {
      (ui.menus[0].tabs[2].get("file").self as HTMLInputElement).files = event.clipboardData.files
      event.stopPropagation()
    }
  })
}*/
