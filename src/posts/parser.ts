import { ui } from "../ui"

export async function mutatePyu(quote: HTMLQuoteElement) {
  for (const strong of quote.getElementsByTagName("strong")) {
    if (!strong.classList.contains('thousand_pyu') && strong.innerText.includes("#pyu") && !(parseInt(strong.innerText.slice(6, -1)) % 1000)) {
      strong.innerText = `💦${strong.innerText}💦`
      strong.classList.add("thousand_pyu")
    }
  }
}

export async function mutateChuu(post: Element, quote: HTMLQuoteElement, ownName: Element) {
  const kPost = quote.innerHTML.match(/#chuu\( ?(\d*) ?\)/g)

  if (kPost) {
    for (const chuu of kPost) {
      const id = chuu.slice(6, -1),
        kissed = document.getElementById(`p${id}`)
      let lastIndex = 0

      if (kissed) {
        const index = quote.innerHTML.indexOf(chuu, lastIndex),
          name = kissed.getElementsByClassName("name spaced")
        let html = "<strong"

        if (
          name.length &&
          name[0].getElementsByTagName("I").length &&
          new Date().getTime() < new Date(ownName.parentElement.getElementsByTagName("time")[0].title).getTime() + 60000
        ) {
          if (ownName.getElementsByTagName("I").length) {
            continue
          }

          ui.menus[0].tabs[0].get("chuus").incrementCount(0, 0, "chuu", 'chuu~{!($count % 10) ? "\\nCongratulations on your pregnancy!\\nYou now have [$count / 10] children!" : ""}')
          html += ' class="lewd_color"'
        }

        html = `${html}>#chuu~(${id})</strong>`
        quote.innerHTML = `${quote.innerHTML.substring(lastIndex, index)}${html}${quote.innerHTML.substring(index + chuu.length)}`
        lastIndex = index + html.length
      }
    }
  }
}

export async function mutateDumbPost(name: Element, text: string) {
  const dumb = text.toLowerCase().match("dumb ?.{0,20}posters?"),
    cute = text.toLowerCase().match("cute ?.{0,20}posters?"),
    uppers = text.match(/[A-Z]/g),
    yous = text.match(/(?:>>\d* (?:\(You\) )?#)/g)

  if (!text.length && !name.parentElement.parentElement.getElementsByTagName("figcaption").length) {
    addToName(name, `${ui.menus[0].tabs[1].get("blanc").enabled ? "dumb" : "cute"} blancposter`)
  } else if (text.includes("~")) {
    addToName(name, "dumb ~poster")
  } else if (dumb) {
    addToName(name, `dumb '${dumb[0]}' poster`)
  } else if (cute) {
    addToName(name, `cute '${cute[0]}' poster`)
  } else if (text.toLowerCase().includes("wait anon")) {
    addToName(name, "dumb haiku poster / 'wait anon' is all she says / don't wait, run away!")
  } else if (text.toLowerCase().includes("virus")) {
    addToName(name, "virus post do not read")
  } else if (text.length && text.match(/[a-z]/g) && ((!uppers && !yous) || (uppers && yous && uppers.length === yous.length))) {
    addToName(name, "dumb lowercaseposter")
  }
}

export async function mutateDecision(quote: HTMLQuoteElement) {
  const dPost = quote.innerHTML.match(/\[?([^#><\]\[]*)\]?\s<strong( class=\"\w+\")?>#d([0-9]+) \(([0-9]+)\)<\/strong>/g)

  if (dPost) {
    for (const decide of dPost) {
      if (!decide.includes("decision_roll")) {
        const split = decide.split(/\s<strong( class=\"\w+\")?>/g),
          opts = split[0].replace(/[\[\]]+/g, '').split(','),
          roll = split.slice(-1)[0].split("</strong>")[0].split(/\s/g)

        if (opts.length > 1 && opts.length === parseInt(roll[0].substring(2))) {
          const index = quote.innerHTML.indexOf(decide),
            val = parseInt(roll.slice(-1)[0].substring(1))
          opts[val - 1] = `<strong class="decision_roll">${opts[val - 1]}</strong>`
          quote.innerHTML = `${quote.innerHTML.substring(0, index)}${opts} <strong>${roll}</strong>${quote.innerHTML.substring(index + decide.length)}`
        }
      }
    }
  }
}

export async function mutateShares(quote: HTMLQuoteElement) {
  const sPost = quote.innerHTML.match(/\[([^\]\[]*)\]\s<strong( class=\"\w+\")?>#(\d+)d(\d+) \(([\d +]* )*= (?:\d+)\)<\/strong>/g)

  if (sPost) {
    for (const shares of sPost) {
      if (!shares.includes('_wins">')) {
        const split = shares.split(/\s<strong( class=\"\w+\")?>/g),
          opts = split[0].replace(/[\[\]]+/g, '').split(','),
          roll = split.slice(-1)[0].split("</strong>")[0].split(/\s/g),
          rivals = roll[0].split('d'),
          vals: number[] = new Array()

        for (const val of split.slice(-1)[0].match(/\(([\d +]* )*=/g).toString().slice(1, -2).split(" + ")) {
          vals.push(parseInt(val))
        }

        if (opts.length > 1 && opts.length === vals.length && opts.length === parseInt(rivals[0].substring(1))) {
          const index = quote.innerHTML.indexOf(shares),
            highest = Math.max.apply(Math, vals),
            max = rivals.slice(-1)[0]

          for (const [i, val] of vals.entries()) {
            const formattedRoll = ` (${val} / ${max})`

            if (val === highest) {
              let winner = '</strong><strong class="'

              if (opts[i].match(/(^|\W)planeptune($|\W)(?!\w)/i)) {
                winner += "planeptune_wins"
              } else if (opts[i].match(/(^|\W)lastation($|\W)(?!\w)/i)) {
                winner += "lastation_wins"
              } else if (opts[i].match(/(^|\W)lowee($|\W)(?!\w)/i)) {
                winner += "lowee_wins"
              } else if (opts[i].match(/(^|\W)leanbox($|\W)(?!\w)/i)) {
                winner += "leanbox_wins"
              } else {
                winner += "decision_roll"
              }

              opts[i] = `${winner}">${opts[i]}${formattedRoll}</strong><strong>`
            } else {
              opts[i] = `${opts[i]}${formattedRoll}`
            }
          }

          quote.innerHTML = `${quote.innerHTML.substring(0, index)}<strong>${opts.join("<br>")}</strong>${quote.innerHTML.substring(index + shares.length)}`
        }
      }
    }
  }
}

async function addToName(name: Element, msg: string) {
  name.insertAdjacentHTML("afterend", `<span id="dumbposter"> (${msg})</span>`)
}
