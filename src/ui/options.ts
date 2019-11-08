import { ui } from "."
import { /*submitSecret, */downloadAllowedFiles } from "../posts"

export const enum types {
  text,
  checkbox,
  input,
  textarea,
  division,
  fileInput
}

export class Option {
  readonly self: HTMLElement
  readonly id: string
  readonly type: types
  private readonly storeEnabled: string
  private readonly storeVal: string
  readonly name: string
  readonly description: string
  private _enabled: boolean
  private _value: number | string

  get enabled() {
    return this._enabled
  }

  set enabled(enabled: boolean) {
    this._enabled = enabled
    localStorage.setItem(this.storeEnabled, enabled ? "on" : "off")
  }

  get value() {
    return this._value
  }

  set value(value: number | string) {
    this._value = value
    localStorage.setItem(this.storeVal, value.toString())
  }

  constructor(
    parent: HTMLDivElement,
    id: string,
    type: types,
    storeEnabled?: string,
    storeVal?: string,
    name?: string,
    description?: string,
    enabled?: boolean,
    value?: number | string,
    buttId?: string,
    buttDesc?: string,
    buttCallback?: (value?: string) => void
  ) {
    this.id = id
    this.type = type
    this.storeEnabled = storeEnabled
    this.storeVal = storeVal
    this.name = name
    this.description = description
    this._enabled = enabled
    this._value = value

    if (storeEnabled) {
      this._enabled = localStorage.getItem(storeEnabled) === "on" ? true : false
    }

    if (storeVal) {
      const fetched = localStorage.getItem(storeVal),
        isNumber = fetched === "Infinity" ? Infinity : parseInt(fetched)

      if (storeEnabled && storeVal !== "chuuCount") {
        this._enabled = isNumber ? true : false
      }

      if (fetched) {
        this._value = isNaN(isNumber) ? fetched : isNumber
      }
    }

    switch (type) {
      case types.text:
        this.self = parent.appendChild(this.createMenuText())
        break
      case types.checkbox:
        this.self = parent.appendChild(this.createMenuCheckBox())
        break
      case types.input:
        this.self = parent.appendChild(this.createMenuInput(buttId, buttDesc, buttCallback))
        break
      case types.textarea:
        this.self = parent.appendChild(this.createMenuTextArea(buttId, buttCallback))
        break
      case types.division:
        this.self = parent.appendChild(this.createElementFromHTML("<br/><hr/>"))
        break
      case types.fileInput:
        this.self = parent.appendChild(this.createMenuFileInput(buttId))
    }
  }

  private createElementFromHTML(html: string): HTMLDivElement {
    const div = document.createElement("div")
    div.innerHTML = html.trim()
    return div
  }

  private createMenuCheckBox(): HTMLDivElement {
    const res = this.createElementFromHTML(`<input type="checkbox" name="${this.storeEnabled}" id="${this.storeEnabled}"><label for="${this.storeEnabled}">${this.name}</label><br>`),
      input = res.getElementsByTagName("input")[0]
    input.checked = this.enabled
    input.onchange = () => this.enabled = input.checked

    if (this.description) {
      res.getElementsByTagName("label")[0].setAttribute("title", this.description)
    }

    return res
  }

  private createMenuText(): HTMLParagraphElement {
    const p = document.createElement("p")
    p.innerHTML = this.description
    return p
  }

  private createMenuInput(id?: string, description?: string, callback?: (value?: string) => void): HTMLDivElement {
    const res = this.createElementFromHTML(`<label for="${this.storeVal}">${this.name}</label><input type="textbox" name="${this.storeVal}" id="${this.storeVal}"/><button type="button" id="${id || this.storeVal}_button">${description || "Save"}</button><br>`),
      input = res.getElementsByTagName("input")[0]
    input.value = this.value.toString()

    res.getElementsByTagName("button")[0].onclick = () => {
      this.value = input.value

      if (callback) {
        callback(input.value)
      }
    }

    return res
  }

  private createMenuTextArea(id?: string, callback?: (value?: string) => void): HTMLDivElement {
    const res = this.createElementFromHTML(`<label for="${this.storeVal}">${this.name}</label><br/><textarea rows=4 cols=60 id="${this.storeVal}"></textarea><br/><button type="button" id="${this.storeVal}_button">${id || "Save"}</button><br>`),
      input = res.getElementsByTagName("textarea")[0]
    input.value = this.value.toString()

    res.getElementsByTagName("button")[0].onclick = () => {
      this.value = input.value

      if (callback) {
        callback(input.value)
      }
    }

    return res
  }

  private createMenuFileInput(id: string): HTMLInputElement {
    return this.createElementFromHTML(`<input name="${id}" id="${id}" type="file">`).firstElementChild as HTMLInputElement
  }

  async incrementCount(menu: number, tab: number, getID: string, message?: string) {
    const counter = this.self.getElementsByTagName("span")

    if (counter.length) {
      const count = ++(ui.menus[menu].tabs[tab].get(getID).value as number)
      counter[0].innerText = count.toString()

      if (message) {
        alert(message
          .replace(/\$count/g, count.toString())
          .replace(/\{([^}]+)\}/g, (match: string) => match ? eval(match) : "???")
          .replace(/\[([^\]]+)\]/g, (match: string) => match ? eval(match) : "???")
        )
      }
    } else {
      console.warn(`megukascript: HTML span counter for ${getID} does not exist`)
    }
  }
}

export const options = [
  [
    [
      "decide",
      types.checkbox,
      "decideOption",
      undefined,
      "Decision Coloring",
      "Used for picking decisions like in: a, b, c #d3(2)",
      true
    ], [
      "shares",
      types.checkbox,
      "sharesOption",
      undefined,
      "Shares Formatting",
      "Works for highlighting when rolling for Lastation, Lowee, etc...",
      true
    ], [
      "chuu",
      types.checkbox,
      "chuuOption",
      "chuuCount",
      "Enable receivement of chuu~s<br>",
      "chuu cuties with #chuu([postnumber]) and watch them awawa",
      true,
      0
    ], [
      "vibrate",
      types.input,
      "screamingPosters",
      "vibration",
      "Vibration Duration: ",
      undefined,
      true,
      Infinity
    ], [
      "flash",
      types.input,
      undefined,
      "flashing",
      "Flashing Duration: ",
      undefined,
      undefined,
      Infinity
    ], [
      "chuus",
      types.text,
      undefined,
      undefined,
      undefined,
      '<br><a href="https://github.com/GoatSalad/megukascript/blob/master/README.md" target="_blank">How do I use this?</a>' +
      `<br>You have received <span>${parseInt(localStorage.getItem("chuuCount")) || 0}</span> chuu~'s.`
    ]
  ], [
    [
      "dumb",
      types.checkbox,
      "dumbPosters",
      undefined,
      "Dumb xposters",
      'Puts a "dumb xposter" label next to dumb xposters',
      true
    ], [
      "pyu",
      types.checkbox,
      "pyuOption",
      undefined,
      "Pyu Coloring~",
      "Colors every thousandth pyu",
      true
    ], [
      "blanc",
      types.checkbox,
      "dumbBlanc",
      undefined,
      "Dumb blancposters, not cute",
      "Enable if you think blancposters aren't cute aka never",
      true
    ], [
      "deleted",
      types.checkbox,
      "showDeletedPosts",
      undefined,
      "Show deleted posts",
      "Auto-expand deleted posters",
      true
    ]
  ],/* [
    [
      "text",
      types.checkbox,
      "sekritPosting",
      undefined,
      "Secret Posting",
      "Decipher the sekritposting",
      true
    ], [
      "image",
      types.checkbox,
      "imgsekritPosting",
      undefined,
      "Image Secret Posting<br>",
      "Decipher the imgsekritposting (hover to analyze)",
      true
    ], [
      "encode",
      types.input,
      undefined,
      "hidetext",
      "Encode text:<br>",
      undefined,
      undefined,
      '',
      "secretButton",
      "Convert & Input",
      submitSecret
    ], [
      "file",
      types.fileInput,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "secretImage"
    ]
  ], */[
    [
      "format",
      types.checkbox,
      "annoyingFormatting",
      undefined,
      "Annoying formatting button<br>",
      "Enables a very useful button next to text form",
      true
    ], [
      "steal",
      types.input,
      undefined,
      "stealFileInput",
      "Steal all files ending with:<br>",
      undefined,
      undefined,
      ".jpg .jpeg .png .gif .webp",
      undefined,
      "Steal files",
      downloadAllowedFiles
    ]/*, [
      "division",
      types.division
    ], [
      "mmp",
      types.text,
      undefined,
      undefined,
      undefined,
      "<b>Meguca Music Player (aka. MMP)</b><br><br>" +
      "Automatically grabs whatever audio files are posted in the thread<br>" +
      "and puts them into a nice playlist for your very own comfort.<br>" +
      "Will loop around on reaching last song, even.<br>"
    ], [
      "enable",
      types.checkbox,
      "enablemegucaplayer",
      undefined,
      "Enable music player",
      undefined,
      false
    ], [
      "show",
      types.checkbox,
      "megucaplayerOption",
      undefined,
      "Show music player",
      undefined,
      false
    ]*/
  ]
]
