// ==UserScript==
// @name megucascript
// @namespace megucasoft
// @author medukasthegucas
// @version 4.0.0
// @description Does a lot of stuff
// @icon icon.jpg
// @require almond.js
// @match *://127.0.0.1:8000/*
// @match *://meguca.org/*
// @match *://chiru.no/*
// @match *://megu.ca/*
// @match *://kirara.cafe/*
// @match *://shamik.ooo/*
// @exclude /^.*://127.0.0.1:8000/(api|assets|html|json)/.*$/
// @exclude /^.*://meguca.org/(api|assets|html|json)/.*$/
// @exclude /^.*://chiru.no/(api|assets|html|json)/.*$/
// @exclude /^.*://megu.ca/(api|assets|html|json)/.*$/
// @exclude /^.*://kirara.cafe/(api|assets|html|json)/.*$/
// @exclude /^.*://shamik.ooo/(api|assets|html|json)/.*$/
// ==/UserScript==

define("common/index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const splitPath = window.location.pathname.split("/");
    exports.url = window.location.href, exports.protocol = window.location.protocol, exports.host = window.location.hostname, exports.path = window.location.pathname, exports.boards = window.boards, exports.board = splitPath[1], exports.catalog = splitPath[2] === "catalog", exports.thread = parseInt(splitPath[2]) || 0, exports.last100 = exports.url.match(/last\=([0-9]+)/) ? true : false;
    function initCommon() {
        if (!exports.boards) {
            throw new Error("megukascript: Invalid boards variable, stopping");
        }
        exports.boards.push("all");
        if (!exports.boards.includes(exports.board)) {
            throw new Error("megukascript: Invalid board, stopping");
        }
    }
    exports.initCommon = initCommon;
});
define("posts/parser", ["require", "exports", "ui/index"], function (require, exports, ui_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function mutatePyu(quote) {
        for (const strong of quote.getElementsByTagName("strong")) {
            if (!strong.classList.contains('thousand_pyu') && strong.innerText.includes("#pyu") && !(parseInt(strong.innerText.slice(6, -1)) % 1000)) {
                strong.innerText = `💦${strong.innerText}💦`;
                strong.classList.add("thousand_pyu");
            }
        }
    }
    exports.mutatePyu = mutatePyu;
    async function mutateChuu(post, quote, ownName) {
        const kPost = quote.innerHTML.match(/#chuu\( ?(\d*) ?\)/g);
        if (kPost) {
            for (const chuu of kPost) {
                const id = chuu.slice(6, -1), kissed = document.getElementById(`p${id}`);
                let lastIndex = 0;
                if (kissed) {
                    const index = quote.innerHTML.indexOf(chuu, lastIndex), name = kissed.getElementsByClassName("name spaced");
                    let html = "<strong";
                    if (name.length &&
                        name[0].getElementsByTagName("I").length &&
                        new Date().getTime() < new Date(ownName.parentElement.getElementsByTagName("time")[0].title).getTime() + 60000) {
                        if (ownName.getElementsByTagName("I").length) {
                            continue;
                        }
                        ui_1.ui.menus[0].tabs[0].get("chuus").incrementCount(0, 0, "chuu", 'chuu~{!($count % 10) ? "\\nCongratulations on your pregnancy!\\nYou now have [$count / 10] children!" : ""}');
                        html += ' class="lewd_color"';
                    }
                    html = `${html}>#chuu~(${id})</strong>`;
                    quote.innerHTML = `${quote.innerHTML.substring(lastIndex, index)}${html}${quote.innerHTML.substring(index + chuu.length)}`;
                    lastIndex = index + html.length;
                }
            }
        }
    }
    exports.mutateChuu = mutateChuu;
    async function mutateDumbPost(name, text) {
        const dumb = text.toLowerCase().match("dumb ?.{0,20}posters?"), cute = text.toLowerCase().match("cute ?.{0,20}posters?"), uppers = text.match(/[A-Z]/g), yous = text.match(/(?:>>\d* (?:\(You\) )?#)/g);
        if (!text.length && !name.parentElement.parentElement.getElementsByTagName("figcaption").length) {
            addToName(name, `${ui_1.ui.menus[0].tabs[1].get("blanc").enabled ? "dumb" : "cute"} blancposter`);
        }
        else if (text.includes("~")) {
            addToName(name, "dumb ~poster");
        }
        else if (dumb) {
            addToName(name, `dumb '${dumb[0]}' poster`);
        }
        else if (cute) {
            addToName(name, `cute '${cute[0]}' poster`);
        }
        else if (text.toLowerCase().includes("wait anon")) {
            addToName(name, "dumb haiku poster / 'wait anon' is all she says / don't wait, run away!");
        }
        else if (text.toLowerCase().includes("virus")) {
            addToName(name, "virus post do not read");
        }
        else if (text.length && text.match(/[a-z]/g) && ((!uppers && !yous) || (uppers && yous && uppers.length === yous.length))) {
            addToName(name, "dumb lowercaseposter");
        }
    }
    exports.mutateDumbPost = mutateDumbPost;
    async function mutateDecision(quote) {
        const dPost = quote.innerHTML.match(/\[?([^#><\]\[]*)\]?\s<strong( class=\"\w+\")?>#d([0-9]+) \(([0-9]+)\)<\/strong>/g);
        if (dPost) {
            for (const decide of dPost) {
                if (!decide.includes("decision_roll")) {
                    const split = decide.split(/\s<strong( class=\"\w+\")?>/g), opts = split[0].replace(/[\[\]]+/g, '').split(','), roll = split.slice(-1)[0].split("</strong>")[0].split(/\s/g);
                    if (opts.length > 1 && opts.length === parseInt(roll[0].substring(2))) {
                        const index = quote.innerHTML.indexOf(decide), val = parseInt(roll.slice(-1)[0].substring(1));
                        opts[val - 1] = `<strong class="decision_roll">${opts[val - 1]}</strong>`;
                        quote.innerHTML = `${quote.innerHTML.substring(0, index)}${opts} <strong>${roll}</strong>${quote.innerHTML.substring(index + decide.length)}`;
                    }
                }
            }
        }
    }
    exports.mutateDecision = mutateDecision;
    async function mutateShares(quote) {
        const sPost = quote.innerHTML.match(/\[([^\]\[]*)\]\s<strong( class=\"\w+\")?>#(\d+)d(\d+) \(([\d +]* )*= (?:\d+)\)<\/strong>/g);
        if (sPost) {
            for (const shares of sPost) {
                if (!shares.includes('_wins">')) {
                    const split = shares.split(/\s<strong( class=\"\w+\")?>/g), opts = split[0].replace(/[\[\]]+/g, '').split(','), roll = split.slice(-1)[0].split("</strong>")[0].split(/\s/g), rivals = roll[0].split('d'), vals = new Array();
                    for (const val of split.slice(-1)[0].match(/\(([\d +]* )*=/g).toString().slice(1, -2).split(" + ")) {
                        vals.push(parseInt(val));
                    }
                    if (opts.length > 1 && opts.length === vals.length && opts.length === parseInt(rivals[0].substring(1))) {
                        const index = quote.innerHTML.indexOf(shares), highest = Math.max.apply(Math, vals), max = rivals.slice(-1)[0];
                        for (const [i, val] of vals.entries()) {
                            const formattedRoll = ` (${val} / ${max})`;
                            if (val === highest) {
                                let winner = '</strong><strong class="';
                                if (opts[i].match(/(^|\W)planeptune($|\W)(?!\w)/i)) {
                                    winner += "planeptune_wins";
                                }
                                else if (opts[i].match(/(^|\W)lastation($|\W)(?!\w)/i)) {
                                    winner += "lastation_wins";
                                }
                                else if (opts[i].match(/(^|\W)lowee($|\W)(?!\w)/i)) {
                                    winner += "lowee_wins";
                                }
                                else if (opts[i].match(/(^|\W)leanbox($|\W)(?!\w)/i)) {
                                    winner += "leanbox_wins";
                                }
                                else {
                                    winner += "decision_roll";
                                }
                                opts[i] = `${winner}">${opts[i]}${formattedRoll}</strong><strong>`;
                            }
                            else {
                                opts[i] = `${opts[i]}${formattedRoll}`;
                            }
                        }
                        quote.innerHTML = `${quote.innerHTML.substring(0, index)}<strong>${opts.join("<br>")}</strong>${quote.innerHTML.substring(index + shares.length)}`;
                    }
                }
            }
        }
    }
    exports.mutateShares = mutateShares;
    async function addToName(name, msg) {
        name.insertAdjacentHTML("afterend", `<span id="dumbposter"> (${msg})</span>`);
    }
});
define("util/index", ["require", "exports", "ui/index"], function (require, exports, ui_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getIterations(period) {
        return ui_2.ui.menus[0].tabs[0].get("flash").value / period;
    }
    exports.getIterations = getIterations;
    function getVibrationIterations() {
        return ui_2.ui.menus[0].tabs[0].get("vibrate").value * 2;
    }
    exports.getVibrationIterations = getVibrationIterations;
    function formatWord(word) {
        const format = ["~~", "**", "@@", "``", "^r", "^b"][Math.floor(Math.random() * 6)];
        return `${format}${word}${format}`;
    }
    exports.formatWord = formatWord;
});
define("posts/index", ["require", "exports", "posts/parser", "common/index", "ui/index", "util/index"], function (require, exports, parser_1, common_1, ui_3, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const threadContainer = document.getElementById(common_1.catalog ? "catalog" : common_1.thread ? "thread-container" : "index-thread-container"), scanned = new Array();
    async function initPosts() {
        if (!threadContainer) {
            throw new Error("megukascript: Unable to find thread container, stopping");
        }
        scanPosts(1);
        new MutationObserver((muts) => mutatedPost(muts)).observe(threadContainer, { childList: true, subtree: true });
    }
    exports.initPosts = initPosts;
    async function downloadAllowedFiles(value) {
        if (!common_1.catalog) {
            scanPosts(0, value.split(' '));
        }
    }
    exports.downloadAllowedFiles = downloadAllowedFiles;
    async function scanPosts(action, val) {
        if (common_1.thread || common_1.catalog) {
            return postsActions(threadContainer.getElementsByTagName("article"), action, val);
        }
        for (const index of threadContainer.getElementsByClassName("index-thread")) {
            dispatchAction(index);
            postsActions(index.getElementsByTagName("article"), action, val);
        }
    }
    async function postsActions(posts, action, val) {
        if (posts.length) {
            for (const post of posts) {
                if (!post.classList.contains("editing")) {
                    dispatchAction(post, action, val);
                }
            }
        }
        else {
            console.warn("megukascript: Posts in thread container do not exist");
        }
    }
    async function dispatchAction(post, action, val) {
        switch (action) {
            case 0:
                downloadPostImage(post, val);
                break;
            case 2:
                scanPost(post, true);
                break;
            case 1:
                scanPost(post);
            default:
                toggleDeletedPost(post);
        }
    }
    async function downloadPostImage(post, types) {
        const fig = post.getElementsByTagName("figcaption");
        if (fig.length && fig[0].lastElementChild && fig[0].lastElementChild.hasAttribute("href")) {
            for (const type of types) {
                if (fig[0].lastElementChild.getAttribute("href").endsWith(type)) {
                    fig[0].lastElementChild.click();
                }
            }
        }
    }
    async function toggleDeletedPost(post) {
        if (post.classList.contains("deleted")) {
            const del = post.getElementsByClassName("deleted-toggle");
            if (del.length) {
                del[0].checked = ui_3.ui.menus[0].tabs[1].get("deleted").enabled;
            }
            else {
                console.warn(`megukascript: Post '${post.id}' is deleted but does not contain 'deleted-toggle' class`);
            }
        }
    }
    async function scanPost(post, bypass) {
        const name = post.getElementsByClassName("name spaced"), quote = post.getElementsByTagName("blockquote");
        if (quote.length) {
            let text = quote[0].innerText;
            if (ui_3.ui.menus[0].tabs[0].get("chuu").enabled && name.length) {
                parser_1.mutateChuu(post, quote[0], name[0]);
            }
            if (ui_3.ui.menus[0].tabs[1].get("pyu").enabled) {
                parser_1.mutatePyu(quote[0]);
            }
            if (ui_3.ui.menus[0].tabs[0].get("decide").enabled) {
                parser_1.mutateDecision(quote[0]);
            }
            if (ui_3.ui.menus[0].tabs[0].get("shares").enabled) {
                parser_1.mutateShares(quote[0]);
            }
            if ((ui_3.ui.menus[0].tabs[1].get("dumb").enabled && name.length && name[0].tagName === "B" && !quote[0].innerHTML.includes("<strong>#")) &&
                (!name[0].nextElementSibling || name[0].nextElementSibling.id !== "dumbposter")) {
                parser_1.mutateDumbPost(name[0], text);
            }
            text = text.replace(/(?:>>\d* (?:\(You\) )?#)/g, '').replace(/(?:>>\d*)/g, '').replace(/[\s\W\d_]/g, '');
            if (ui_3.ui.menus[0].tabs[0].get("vibrate").enabled &&
                !post.classList.contains("shaking_post") &&
                text.length > 5 &&
                text === text.toUpperCase()) {
                post.classList.add("shaking_post");
            }
            if (!bypass) {
                scanned.push(post.id);
            }
        }
    }
    async function addFormatButton(post) {
        if (ui_3.ui.menus[0].tabs[2].get("format").enabled) {
            const controls = document.getElementById("post-controls");
            if (controls) {
                const container = controls.getElementsByClassName("upload-container");
                if (container.length) {
                    const button = container[0].insertAdjacentElement("beforebegin", document.createElement("input"));
                    button.id = "format-button";
                    button.type = "button";
                    button.name = "format";
                    button.value = "Format";
                    button.onclick = formatPost;
                }
                else {
                    console.warn(`megukascript: Post '${post.id}' upload container does not exist`);
                }
            }
        }
    }
    async function formatPost() {
        const input = document.getElementById("text-input"), event = document.createEvent("HTMLEvents");
        if (input && event) {
            input.value = input.value.split(' ').map(util_1.formatWord).join(' ');
            event.initEvent("input", false, true);
            input.dispatchEvent(event);
        }
    }
    async function mutatedPost(muts) {
        for (const mut of muts) {
            let post = mut.target, bypass = false;
            switch (post.tagName) {
                case "ARTICLE":
                    break;
                case "DIV":
                    if (post.classList.contains("post-container")) {
                        post = post.parentElement;
                        break;
                    }
                    continue;
                case "BLOCKQUOTE":
                    if (post.parentElement.classList.contains("post-container")) {
                        post = post.parentElement.parentElement;
                        bypass = true;
                        break;
                    }
                    continue;
                case "SECTION":
                    if (post.id === "thread-container") {
                        post = document.getElementById("p0");
                        if (post && post.classList.contains("reply-form") && !document.getElementById("format-button")) {
                            addFormatButton(post);
                        }
                    }
                default:
                    continue;
            }
            if (post.id !== "p0" && !post.classList.contains("editing")) {
                bypass ? dispatchAction(post, 2) : scanned.includes(post.id) ? dispatchAction(post) : dispatchAction(post, 1);
            }
        }
    }
});
define("ui/options", ["require", "exports", "ui/index", "posts/index"], function (require, exports, _1, posts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Option {
        constructor(parent, id, type, storeEnabled, storeVal, name, description, enabled, value, buttId, buttDesc, buttCallback) {
            this.id = id;
            this.type = type;
            this.storeEnabled = storeEnabled;
            this.storeVal = storeVal;
            this.name = name;
            this.description = description;
            this._enabled = enabled;
            this._value = value;
            if (storeEnabled) {
                this._enabled = localStorage.getItem(storeEnabled) === "on" ? true : false;
            }
            if (storeVal) {
                const fetched = localStorage.getItem(storeVal), isNumber = fetched === "Infinity" ? Infinity : parseInt(fetched);
                if (storeEnabled && storeVal !== "chuuCount") {
                    this._enabled = isNumber ? true : false;
                }
                if (fetched) {
                    this._value = isNaN(isNumber) ? fetched : isNumber;
                }
            }
            switch (type) {
                case 0:
                    this.self = parent.appendChild(this.createMenuText());
                    break;
                case 1:
                    this.self = parent.appendChild(this.createMenuCheckBox());
                    break;
                case 2:
                    this.self = parent.appendChild(this.createMenuInput(buttId, buttDesc, buttCallback));
                    break;
                case 3:
                    this.self = parent.appendChild(this.createMenuTextArea(buttId, buttCallback));
                    break;
                case 4:
                    this.self = parent.appendChild(this.createElementFromHTML("<br/><hr/>"));
                    break;
                case 5:
                    this.self = parent.appendChild(this.createMenuFileInput(buttId));
            }
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(enabled) {
            this._enabled = enabled;
            localStorage.setItem(this.storeEnabled, enabled ? "on" : "off");
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this._value = value;
            localStorage.setItem(this.storeVal, value.toString());
        }
        createElementFromHTML(html) {
            const div = document.createElement("div");
            div.innerHTML = html.trim();
            return div;
        }
        createMenuCheckBox() {
            const res = this.createElementFromHTML(`<input type="checkbox" name="${this.storeEnabled}" id="${this.storeEnabled}"><label for="${this.storeEnabled}">${this.name}</label><br>`), input = res.getElementsByTagName("input")[0];
            input.checked = this.enabled;
            input.onchange = () => this.enabled = input.checked;
            if (this.description) {
                res.getElementsByTagName("label")[0].setAttribute("title", this.description);
            }
            return res;
        }
        createMenuText() {
            const p = document.createElement("p");
            p.innerHTML = this.description;
            return p;
        }
        createMenuInput(id, description, callback) {
            const res = this.createElementFromHTML(`<label for="${this.storeVal}">${this.name}</label><input type="textbox" name="${this.storeVal}" id="${this.storeVal}"/><button type="button" id="${id || this.storeVal}_button">${description || "Save"}</button><br>`), input = res.getElementsByTagName("input")[0];
            input.value = this.value.toString();
            res.getElementsByTagName("button")[0].onclick = () => {
                this.value = input.value;
                if (callback) {
                    callback(input.value);
                }
            };
            return res;
        }
        createMenuTextArea(id, callback) {
            const res = this.createElementFromHTML(`<label for="${this.storeVal}">${this.name}</label><br/><textarea rows=4 cols=60 id="${this.storeVal}"></textarea><br/><button type="button" id="${this.storeVal}_button">${id || "Save"}</button><br>`), input = res.getElementsByTagName("textarea")[0];
            input.value = this.value.toString();
            res.getElementsByTagName("button")[0].onclick = () => {
                this.value = input.value;
                if (callback) {
                    callback(input.value);
                }
            };
            return res;
        }
        createMenuFileInput(id) {
            return this.createElementFromHTML(`<input name="${id}" id="${id}" type="file">`).firstElementChild;
        }
        async incrementCount(menu, tab, getID, message) {
            const counter = this.self.getElementsByTagName("span");
            if (counter.length) {
                const count = ++_1.ui.menus[menu].tabs[tab].get(getID).value;
                counter[0].innerText = count.toString();
                if (message) {
                    alert(message
                        .replace(/\$count/g, count.toString())
                        .replace(/\{([^}]+)\}/g, (match) => match ? eval(match) : "???")
                        .replace(/\[([^\]]+)\]/g, (match) => match ? eval(match) : "???"));
                }
            }
            else {
                console.warn(`megukascript: HTML span counter for ${getID} does not exist`);
            }
        }
    }
    exports.Option = Option;
    exports.options = [
        [
            [
                "decide",
                1,
                "decideOption",
                undefined,
                "Decision Coloring",
                "Used for picking decisions like in: a, b, c #d3(2)",
                true
            ], [
                "shares",
                1,
                "sharesOption",
                undefined,
                "Shares Formatting",
                "Works for highlighting when rolling for Lastation, Lowee, etc...",
                true
            ], [
                "chuu",
                1,
                "chuuOption",
                "chuuCount",
                "Enable receivement of chuu~s<br>",
                "chuu cuties with #chuu([postnumber]) and watch them awawa",
                true,
                0
            ], [
                "vibrate",
                2,
                "screamingPosters",
                "vibration",
                "Vibration Duration: ",
                undefined,
                true,
                120
            ], [
                "flash",
                2,
                undefined,
                "flashing",
                "Flashing Duration: ",
                undefined,
                undefined,
                60
            ], [
                "chuus",
                0,
                undefined,
                undefined,
                undefined,
                '<br><a href="https://github.com/GoatSalad/megukascript/blob/master/README.md" target="_blank">How do I use this?</a>' +
                    `<br>You have received <span>${parseInt(localStorage.getItem("chuuCount")) || 0}</span> chuu~'s.`
            ]
        ], [
            [
                "dumb",
                1,
                "dumbPosters",
                undefined,
                "Dumb xposters",
                'Puts a "dumb xposter" label next to dumb xposters',
                true
            ], [
                "pyu",
                1,
                "pyuOption",
                undefined,
                "Pyu Coloring~",
                "Colors every thousandth pyu",
                true
            ], [
                "blanc",
                1,
                "dumbBlanc",
                undefined,
                "Dumb blancposters, not cute",
                "Enable if you think blancposters aren't cute aka never",
                true
            ], [
                "deleted",
                1,
                "showDeletedPosts",
                undefined,
                "Show deleted posts",
                "Auto-expand deleted posters",
                true
            ]
        ],
        [
            [
                "format",
                1,
                "annoyingFormatting",
                undefined,
                "Annoying formatting button<br>",
                "Enables a very useful button next to text form",
                true
            ], [
                "steal",
                2,
                undefined,
                "stealFileInput",
                "Steal all files ending with:<br>",
                undefined,
                undefined,
                ".jpg .jpeg .png .gif .webp",
                undefined,
                "Steal files",
                posts_1.downloadAllowedFiles
            ]
        ]
    ];
});
define("ui/tabs", ["require", "exports", "ui/options"], function (require, exports, options_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Tab {
        constructor(index, header, content, id, name, description) {
            this.id = id;
            this.name = name;
            this.description = description;
            this._options = new Array();
            this.header = this.createSection(header, index);
            this.content = this.createContent(content, index);
            this.populateOptions(index);
        }
        get options() {
            return this._options;
        }
        createSection(parent, id) {
            const sid = id.toString(), section = parent.appendChild(document.createElement("a"));
            section.innerHTML = this.name;
            section.style.padding = "7px";
            section.classList.add("tab-link");
            section.setAttribute("data-id", sid);
            if (!id) {
                section.classList.add("tab-sel");
            }
            section.onclick = () => {
                for (const sect of parent.querySelectorAll(".tab-sel")) {
                    sect.classList.remove("tab-sel");
                }
                section.classList.add("tab-sel");
                for (const content of this.content.parentElement.children) {
                    content.style.display = content.getAttribute("data-id") === sid ? "block" : "none";
                }
            };
            return section;
        }
        createContent(parent, id) {
            const content = parent.appendChild(document.createElement("div"));
            content.style.display = id === 0 ? "block" : "none";
            content.setAttribute("data-id", id.toString());
            content.insertAdjacentHTML("afterbegin", `<p>${this.description}</p>`);
            return content;
        }
        async populateOptions(index) {
            for (const option of options_1.options[index]) {
                this._options.push(new options_1.Option(this.content, option[0], option[1], option[2], option[3], option[4], option[5], option[6], option[7], option[8], option[9], option[10]));
            }
        }
        has(id) {
            for (const option of this._options) {
                if (option.id === id) {
                    return true;
                }
            }
            return false;
        }
        get(id) {
            for (const option of this._options) {
                if (option.id === id) {
                    return option;
                }
            }
            console.warn(`megukascript: Option "${id}" does not exist in Tab "${this.id}"`);
        }
        push(option) {
            return this._options.push(option);
        }
    }
    exports.Tab = Tab;
    exports.tabs = [[
            "general",
            "#Commands and General",
            "Commands and gimmicks for your posts."
        ], [
            "parse",
            "Post Parsing",
            "These options parse posts and then do something (dumb) to them."
        ],
        [
            "fun",
            "FUN STUFF",
            "<b>TANOSHIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII</b>"
        ]];
});
define("ui/index", ["require", "exports", "ui/tabs", "util/index"], function (require, exports, tabs_1, util_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UI {
        constructor(ids, titles, icons, before, callbacks, menuIds) {
            if (!ids.length ||
                ids.length !== titles.length ||
                ids.length !== icons.length ||
                ids.length !== before.length ||
                ids.length !== callbacks.length ||
                ids.length !== menuIds.length) {
                throw new Error("megukascript: Invalid UI constructor parameters");
            }
            const beforeMenu = document.getElementById("options");
            if (!beforeMenu) {
                throw new Error(`megukascript: Unable to find options menu`);
            }
            this.buttons = new Array();
            this.menus = new Array();
            for (const [index, id] of ids.entries()) {
                const option = before[index].insertAdjacentElement("beforebegin", document.createElement("a"));
                if (!option) {
                    console.error(`megukascript: Unable to add custom option "${id}"`);
                    continue;
                }
                option.id = id;
                option.title = titles[index];
                option.innerHTML = icons[index];
                option.onclick = callbacks[index];
                for (const c of before[0].classList) {
                    option.classList.add(c);
                }
                if (menuIds[index]) {
                    const menu = beforeMenu.insertAdjacentElement("beforebegin", document.createElement("div"));
                    if (!menu) {
                        console.error(`megukascript: Unable to add custom menu "${menuIds[index]}"`);
                        continue;
                    }
                    menu.id = menuIds[index];
                    menu.style.display = "none";
                    for (const c of beforeMenu.classList) {
                        menu.classList.add(c);
                    }
                    for (const opt of option.parentElement.getElementsByTagName("a")) {
                        if (opt.id !== id) {
                            opt.addEventListener("click", () => menu.style.display = "none");
                        }
                    }
                    this.populateTabs(menu);
                }
                this.buttons.push(option);
            }
        }
        async populateTabs(parent) {
            const generated = new Array(), header = parent.appendChild(document.createElement("div")), content = parent.appendChild(document.createElement("div"));
            parent.insertBefore(document.createElement("hr"), content);
            for (const [index, tab] of tabs_1.tabs.entries()) {
                generated.push(new tabs_1.Tab(index, header, content, tab[0], tab[1], tab[2]));
            }
            this.menus.push({ self: parent, tabs: generated });
        }
    }
    async function initUI() {
        const before = document.getElementById("banner-options");
        if (!before) {
            throw new Error("megukascript: Unable to find banner options button");
        }
        exports.ui = new UI(["banner-megukascript-options"], ["Megukascript Options"], [
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M2 15s0-6 6-6c4 0 4.5 3.5 7.5 3.5 4 0 4-3.5 4-3.5H22s0 6-6 6c-4 0-5.5-3.5-7.5-3.5-4 0-4 3.5-4 3.5H2"/></svg>'
        ], [before], [
            () => {
                for (const modal of exports.ui.menus[0].self.parentElement.children) {
                    if (modal.id !== "megukascript-options" && modal.id !== "moderation-panel" && modal.id !== "megu-tv") {
                        modal.style.display = "none";
                    }
                }
                exports.ui.menus[0].self.style.display = exports.ui.menus[0].self.style.display === "none" ? "block" : "none";
            }
        ], ["megukascript-options"]);
        insertCSS();
    }
    exports.initUI = initUI;
    async function insertCSS() {
        const css = document.head.appendChild(document.createElement("style"));
        css.type = "text/css";
        css.innerHTML =
            `.lewd_color { animation: lewd_blinker 0.7s linear ${util_2.getIterations(0.7)}; color: pink; } @keyframes lewd_blinker { 50% { color: #FFD6E1 } }
.decision_roll { animation: decision_blinker 0.4s linear 2; color: lightgreen; } @keyframes decision_blinker { 50% { color: green } }
.planeptune_wins { animation: planeptune_blinker 0.6s linear ${util_2.getIterations(0.6)}; color: mediumpurple; } @keyframes planeptune_blinker { 50% { color: #fff} }
.lastation_wins { animation: lastation_blinker 0.6s linear ${util_2.getIterations(0.6)}; color: #000; } @keyframes lastation_blinker { 50% { color: #fff} }
.lowee_wins { animation: lowee_blinker 0.6s linear ${util_2.getIterations(0.6)}; color: #e6e6ff; } @keyframes lowee_blinker { 50% { color: #c59681 }}
.leanbox_wins { animation: leanbox_blinker 0.6s linear ${util_2.getIterations(0.6)}; color: #4dff4d; } @keyframes leanbox_blinker { 50% { color: #fff} }
.thousand_pyu { animation: pyu_blinker 0.4s linear ${util_2.getIterations(0.4)}; color: aqua; } @keyframes pyu_blinker { 50% { color: white } }
.shaking_post { animation: screaming 0.5s linear 0s ${util_2.getVibrationIterations()}; } @keyframes screaming { 0% { -webkit-transform: translate(2px, 1px) rotate(0deg); } 10% { -webkit-transform: translate(-1px, -2px) rotate(-1deg); } 20% { -webkit-transform: translate(-3px, 0px) rotate(1deg); } 30% { -webkit-transform: translate(0px, 2px) rotate(0deg); } 40% { -webkit-transform: translate(1px, -1px) rotate(1deg); } 50% { -webkit-transform: translate(-1px, 2px) rotate(-1deg); } 60% { -webkit-transform: translate(-3px, 1px) rotate(0deg); } 70% { -webkit-transform: translate(2px, 1px) rotate(-1deg); } 80% { -webkit-transform: translate(-1px, -1px) rotate(1deg); } 90% { -webkit-transform: translate(2px, 2px) rotate(0deg); } 100% { -webkit-transform: translate(1px, -2px) rotate(-1deg); } }";`;
    }
});
define("main", ["require", "exports", "common/index", "ui/index", "posts/index"], function (require, exports, common_2, ui_4, posts_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function init() {
        common_2.initCommon();
        ui_4.initUI();
        posts_2.initPosts();
    }
    exports.init = init;
});
require("main").init()
