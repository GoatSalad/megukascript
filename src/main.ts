import { initCommon } from "./common"
import { initUI } from "./ui"
import { initPosts } from "./posts"

// Userscript entry point
export async function init() {
  initCommon()
  initUI()
  initPosts()
}
