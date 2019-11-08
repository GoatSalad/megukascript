import { mutateDecision, mutateShares, mutateDumbPost, mutatePyu, mutateChuu } from "./parser"
import { thread, catalog } from "../common"
import { ui } from "../ui"
import { formatWord } from "../util"

const enum actions {
  download,
  scan
}

const threadContainer = document.getElementById(catalog ? "catalog" : thread ? "thread-container" : "index-thread-container"),
  scanned: string[] = new Array()

export async function initPosts() {
  if (!threadContainer) {
    throw new Error("megukascript: Unable to find thread container, stopping")
  }

  scanPosts(actions.scan)
  new MutationObserver((muts) => mutatedPost(muts)).observe(threadContainer, { childList: true, subtree: true })
}

/*export async function submitSecret() {

}*/

export async function downloadAllowedFiles(value: string) {
  if (!catalog) {
    scanPosts(actions.download, value.split(' '))
  }
}

async function scanPosts(action?: actions, val?: any) {
  if (thread || catalog) {
    return postsActions(threadContainer.getElementsByTagName("article"), action, val)
  }

  for (const index of threadContainer.getElementsByClassName("index-thread")) {
    dispatchAction(index)
    postsActions(index.getElementsByTagName("article"), action, val)
  }
}

async function postsActions(posts: HTMLCollectionOf<HTMLElement>, action: actions, val: any) {
  if (posts.length) {
    for (const post of posts) {
      if (!post.classList.contains("editing")) {
        dispatchAction(post, action, val)
      }
    }
  } else {
    console.warn("megukascript: Posts in thread container do not exist")
  }
}

async function dispatchAction(post: Element, action?: actions, val?: any) {
  switch (action) {
    case actions.download:
      downloadPostImage(post, val)
      break
    case actions.scan:
      //addNewSong(post)
      scanPost(post)
    default:
      toggleDeletedPost(post)
  }
}

async function downloadPostImage(post: Element, types: string[]) {
  const fig = post.getElementsByTagName("figcaption")

  if (fig.length && fig[0].lastElementChild && fig[0].lastElementChild.hasAttribute("href")) {
    for (const type of types) {
      if (fig[0].lastElementChild.getAttribute("href").endsWith(type)) {
        (fig[0].lastElementChild as HTMLAnchorElement).click()
      }
    }
  }
}

async function toggleDeletedPost(post: Element) {
  if (post.classList.contains("deleted")) {
    const del = post.getElementsByClassName("deleted-toggle")

    if (del.length) {
      (del[0] as HTMLInputElement).checked = ui.menus[0].tabs[1].get("deleted").enabled
    } else {
      console.warn(`megukascript: Post '${post.id}' is deleted but does not contain 'deleted-toggle' class`)
    }
  }
}

async function scanPost(post: Element) {
  const name = post.getElementsByClassName("name spaced"),
    quote = post.getElementsByTagName("blockquote")

  if (quote.length) {
    let text = quote[0].innerText

    if (ui.menus[0].tabs[0].get("chuu").enabled && name.length) {
      mutateChuu(post, quote[0], name[0])
    }

    if (ui.menus[0].tabs[1].get("pyu").enabled) {
      mutatePyu(quote[0])
    }

    if (ui.menus[0].tabs[0].get("decide").enabled) {
      mutateDecision(quote[0])
    }

    if (ui.menus[0].tabs[0].get("shares").enabled) {
      mutateShares(quote[0])
    }

    if (
      (ui.menus[0].tabs[1].get("dumb").enabled && name.length && name[0].tagName === "B" && !quote[0].innerHTML.includes("<strong>#")) &&
      (!name[0].nextElementSibling || name[0].nextElementSibling.id !== "dumbposter")
    ) {
      mutateDumbPost(name[0], text)
    }

    text = text.replace(/(?:>>\d* (?:\(You\) )?#)/g, '').replace(/(?:>>\d*)/g, '').replace(/[\s\W\d_]/g, '')

    if (
      ui.menus[0].tabs[0].get("vibrate").enabled &&
      !post.classList.contains("shaking_post") &&
      text.length > 5 &&
      text === text.toUpperCase()
    ) {
      post.classList.add("shaking_post")
    }

    scanned.push(post.id)
  }
}

async function addFormatButton(post: Element) {
  if (ui.menus[0].tabs[2].get("format").enabled) {
    const controls = document.getElementById("post-controls")

    if (controls) {
      const container = controls.getElementsByClassName("upload-container")

      if (container.length) {
        const button = container[0].insertAdjacentElement("beforebegin", document.createElement("input")) as HTMLInputElement
        button.id = "format-button"
        button.type = "button"
        button.name = "format"
        button.value = "Format"
        button.onclick = formatPost
      } else {
        console.warn(`megukascript: Post '${post.id}' upload container does not exist`)
      }
    }
  }
}

async function formatPost() {
  const input = document.getElementById("text-input") as HTMLInputElement,
    event = document.createEvent("HTMLEvents")

  if (input && event) {
    input.value = input.value.split(' ').map(formatWord).join(' ')
    event.initEvent("input", false, true)
    input.dispatchEvent(event)
  }
}

async function mutatedPost(muts: MutationRecord[]) {
  for (const mut of muts) {
    let post = mut.target as HTMLElement

    switch (post.tagName) {
      case "ARTICLE":
        break
      case "DIV":
        if (post.classList.contains("post-container")) {
          post = post.parentElement
          break
        }

        continue
      case "BLOCKQUOTE":
        if (post.parentElement.classList.contains("post-container")) {
          post = post.parentElement.parentElement
          break
        }

        continue
      case "SECTION":
        if (post.id === "thread-container") {
          post = document.getElementById("p0")

          if (post && post.classList.contains("reply-form") && !document.getElementById("format-button")) {
            addFormatButton(post)
          }
        }
      default:
        continue
    }

    if (post.id !== "p0" && !post.classList.contains("editing")) {
      scanned.includes(post.id) ? dispatchAction(post) : dispatchAction(post, actions.scan)
    }
  }
}
