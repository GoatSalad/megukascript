import { types, Option, options } from "./options"

export class Tab {
  readonly header: HTMLAnchorElement
  readonly content: HTMLDivElement
  readonly id: string
  readonly name: string
  readonly description: string
  private _options: Option[]

  get options() {
    return this._options
  }

  constructor(
    index: number,
    header: HTMLDivElement,
    content: HTMLDivElement,
    id: string,
    name: string,
    description: string
  ) {
    this.id = id
    this.name = name
    this.description = description
    this._options = new Array()
    this.header = this.createSection(header, index)
    this.content = this.createContent(content, index)
    this.populateOptions(index)
  }

  private createSection(parent: HTMLDivElement, id: number): HTMLAnchorElement {
    const sid = id.toString(),
      section = parent.appendChild(document.createElement("a"))
    section.innerHTML = this.name
    section.style.padding = "7px"
    section.classList.add("tab-link")
    section.setAttribute("data-id", sid)

    if (!id) {
      section.classList.add("tab-sel")
    }

    section.onclick = () => {
      for (const sect of parent.querySelectorAll(".tab-sel")) {
        sect.classList.remove("tab-sel")
      }

      section.classList.add("tab-sel")

      for (const content of this.content.parentElement.children) {
        (content as HTMLDivElement).style.display = content.getAttribute("data-id") === sid ? "block" : "none"
      }
    }

    return section
  }

  private createContent(parent: HTMLDivElement, id: number): HTMLDivElement {
    const content = parent.appendChild(document.createElement("div"))
    content.style.display = id === 0 ? "block" : "none"
    content.setAttribute("data-id", id.toString())
    content.insertAdjacentHTML("afterbegin", `<p>${this.description}</p>`)
    return content
  }

  private async populateOptions(index: number) {
    for (const option of options[index]) {
      this._options.push(new Option(
        this.content,
        option[0] as string,
        option[1] as types,
        option[2] as string,
        option[3] as string,
        option[4] as string,
        option[5] as string,
        option[6] as boolean,
        option[7] as number | string,
        option[8] as string,
        option[9] as string,
        option[10] as (value?: string) => void
      ))
    }
  }

  has(id: string): boolean {
    for (const option of this._options) {
      if (option.id === id) {
        return true
      }
    }

    return false
  }

  get(id: string): Option {
    for (const option of this._options) {
      if (option.id === id) {
        return option
      }
    }

    console.warn(`megukascript: Option "${id}" does not exist in Tab "${this.id}"`)
  }

  push(option: Option): number {
    return this._options.push(option)
  }
}

export const tabs = [[
  "general",
  "#Commands and General",
  "Commands and gimmicks for your posts."
], [
  "parse",
  "Post Parsing",
  "These options parse posts and then do something (dumb) to them."
],/* [
  "secret",
  "Sekrit Posting",
  "The infamous sekrit posting. Don't let the cops find you."
], */[
  "fun",
  "FUN STUFF",
  "<b>TANOSHIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII</b>"
]]
