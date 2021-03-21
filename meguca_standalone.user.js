// ==UserScript==
// @name        megucascript_standalone
// @namespace   megucasoft
// @description Does a lot of (dumb) stuff
// @include     https://meguca.org/*
// @include     https://chiru.no/*
// @include     https://megu.ca/*
// @include     https://shamiko.org/*
// @include     https://kirara.cafe/*
// @connect     meguca.org
// @connect     chiru.no
// @version     1.0.5
// @author      medukasthegucas
// @grant       GM_xmlhttpRequest
// ==/UserScript==

const defaultFiletypes = ".jpg .png .gif";
var chuuCount = 0;

// Things the user can turn on or off, add your new feature to this list
// All options will be auto generated. What you need to put:
// text: PlainText (HTML is fine too)
// checkbox: paramName, description[, textover tooltip]
// input: paramName, defaultValGetter, description, customButtonCallbackGetter[, customButtonDescription[, customButtonId]]]
// textarea: paramName, defaultValGetter, description, customButtonCallbackGetter[, customButtonDescription]]
// fileInput: paramName
// division: Adds a cool <hr/>
//
// Everything needs to be getters because >javascript and because the options are declared before many of those funcs
// Be sure to add more options on getCurrentOptions() if you need them
const optionsDescription = {
  "#Commands and General": [
    ["text", "Commands and gimmicks for your posts"],
    [
      "checkbox",
      "decideOption",
      "Decision Coloring",
      "Used for picking decisions like in: a, <b>b</b>, c #d3(2)"
    ],
    [
      "checkbox",
      "sharesOption",
      "Shares Formatting",
      "Works for highlighting when rolling for Lastation, Lowee, etc..."
    ],
    [
      "checkbox",
      "mathOption",
      "Enables math parsing",
      "Do math with #math(2 + 2). Supports +, -, /, *, log (on base 2) and ^"
    ],
    [
      "checkbox",
      "chuuOption",
      "Enables receivement of chuu~s<br>",
      "chuu cuties with #chuu([postnumber]) and watch them awawa"
    ],
    [
      "input",
      "vibration",
      () => vibrationDuration,
      "Vibration Duration: ",
      value => saveToLocalStorageInt("vibration", value)
    ],
    [
      "input",
      "flashing",
      () => flashingDuration,
      "Flashing Duration: ",
      value => saveToLocalStorageInt("flashing", value)
    ],
    [
      "text",
      '<br><a href="https://github.com/goatsalad/megukascript/blob/master/README.md" target="_blank">How do I use this?</a>' +
        '<br>You have received <span id="chuu-counter">' +
        (localStorage.getItem("chuuCount", chuuCount) || 0) +
        "</span> chuu~'s"
    ]
  ],
  "Post Parsing": [
    ["text", "These options parse posts and then do something (dumb) to them"],
    [
      "checkbox",
      "dumbPosters",
      "Dumb xposters",
      '(Puts a "dumb xposter" label next to dumb xposters)'
    ],
    ["checkbox", "pyuOption", "Pyu Coloring~", "(Colors every thousandth pyu)"],
    [
      "checkbox",
      "dumbblanc",
      "dumb blancposters, not cute",
      "(Enable if you think blancposters aren't cute aka never)"
    ],
    [
      "checkbox",
      "showDeletedPosts",
      "Show deleted posts",
      "(Auto-expand deleted posters)"
    ],
    ["checkbox", "filterPosts", "Filter posts", "(Enable post filtering)"],
    [
      "textarea",
      "filterArea",
      () => customFilterText,
      "Custom Filters:",
      value => saveToLocalStorageStr("customFilterText", value),
      "Save filters"
    ],
    [
      "checkbox",
      "preSubmitOption",
      "Enables pre-submit post processing (not working)",
      "Disable this for now"
    ]
  ],
  "Sekrit Posting": [
    ["text", "The infamous sekrit posting. Don't let the cops find you"],
    [
      "checkbox",
      "sekritPosting",
      "Secret Posting",
      "(Decypher the sekritposting)"
    ],
    [
      "checkbox",
      "imgsekritPosting",
      "Image Secret Posting<br>",
      "(Decypher the imgsekritposting (hover to analyze))"
    ],
    [
      "input",
      "hidetext",
      () => "",
      "Encode text: ",
      () => secretButtonPressed(),
      "Convert & Input",
      "secretButton"
    ],
    ["fileInput", "secret_image"]
  ],
  "FUN STUFF": [
    [
      "text",
      "<b>TANOSHIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII</b>"
    ],
    ["checkbox", "screamingPosters", "Vibrate screaming posts"],
    [
      "checkbox",
      "annoyingFormatting",
      "Annoying formatting button",
      "Enables a very useful button next to text form"
    ],
    [
      "checkbox",
      "skeletonCount",
      "Shows humans / skeletons instead of humans / total"
    ],
    [
      "checkbox",
      "skeletonLabels",
      "Show human / skeleton labels on the numbers when the above option is enabled"
    ],
    [
      "input",
      "stealFileInput",
      () => defaultFiletypes,
      "Steal all files ending with: ",
      value => downloadAll(value),
      "Steal files"
    ],
    ["division"],
    [
      "text",
      "<b>Meguca Music Player (aka. MMP)</b><br><br>" +
        "Automatically grabs whenever audio files are posted on the thread<br>" +
        "and puts them into a nice playlist for your very own comfort.<br>" +
        "Will loop around on reaching last song, even.<br>" +
        "F5 if you're going from disabled to enabled.<br>" +
        "Disable below if you are a firefox cuck and are having problem with pasting.<br>"
    ],
    ["checkbox", "enablemegucaplayer", "Enable music player"],
    ["checkbox", "megucaplayerOption", "Show music player"]
  ],
  Deprecated: [
    [
      "text",
      "Meguca has already integrated these or changed enough to make these obsolete."
    ],
    ["checkbox", "edenOption", "Eden Now Playing Banner"],
    ["checkbox", "cancelposters", "Dumb cancelposters"],
    ["checkbox", "showWhoDeletedPosts", "Show who deleted/banned posts"]
  ]
};

const onOffOptions = [
  ["edenOption", "Eden Now Playing Banner"],
  ["pyuOption", "Pyu Coloring~"],
  ["decideOption", "Decision Coloring"],
  ["dumbPosters", "Dumb xposters"],
  ["dumbblanc", "dumb blancposters, not cute"],
  ["sharesOption", "Shares Formatting"],
  ["screamingPosters", "Vibrate screaming posts"],
  ["sekritPosting", "Secret Posting"],
  [
    "imgsekritPosting",
    "Image Secret Posting<br><br>(Check off the following option if you have drag and drop problems)"
  ],
  ["enablemegucaplayer", "Enable music player"],
  ["megucaplayerOptionOld", "Show music player<br>"],
  ["annoyingFormatting", "Annoying formatting button"],
  ["mathOption", "Enables math parsing"],
  ["chuuOption", "Enables receivement of chuu~s"],
  ["cancelposters", "Dumb cancelposters"],
  ["showDeletedPosts", "Show deleted posts"],
  ["showWhoDeletedPosts", "Show who deleted/banned posts"],
  ["filterPosts", "Filter posts"],
  [
    "preSubmitOption",
    "Enables pre-submit post processing (necessary for some functions)"
  ],
  ["skeletonCount", "Shows humans / skeletons instead of humans / total"],
  [
    "skeletonLabels",
    "Show human / skeleton labels on the numbers when the above option is enabled"
  ]
];

// The current settings (will be loaded before other methods are called)
var currentlyEnabledOptions = new Set();
// Add custom options here if needed
var flashingDuration = 60;
var vibrationDuration = 20;
var customFilterText =
  "#Custom filters (lines starting with # are ignored)\n\
#text: is assumed by default if you don't specify otherwise\n\
#text:^[Aa]+$\n\
#name:[^(^Anonymous$)]\n\
#id:Fautatkal\n\
#flag:Sweden\n\
#filename:image\\.png\n";
var customFilters = [];
const filterTypes = new Map([
  ["text", ".post-container"],
  ["name", ".name.spaced > span:nth-child(1)"],
  ["id", ".name.spaced > span:nth-child(2)"],
  ["flag", ".flag"],
  ["filename", "figcaption > a:not(.image-toggle)"]
]);

function saveToLocalStorageInt(id, value) {
  var num = Number(value);
  if (Number.isNaN(num)) num = 60;
  localStorage.setItem(id, num > 60 ? 60 : num);
}

function saveToLocalStorageStr(id, value) {
  localStorage.setItem(id, value);
}

function addScriptOptionMenu() {
  const banner = document.getElementById("banner");
  const optionsContainer = banner.getElementsByTagName("span")[0];
  const options = optionsContainer.getElementsByTagName("a");

  const newOption = document.createElement("a");
  newOption.id = "banner-megukascript-options";
  newOption.title = "Megukascript Options";

  const musicOption = document.createElement("a");
  musicOption.id = "toggle-music-player-megukascript";
  musicOption.title = "Toggle MMP visibility";

  // mimics class from other items
  options[0].classList.forEach(c => {
    newOption.classList.add(c);
    musicOption.classList.add(c);
  });
  newOption.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M2 15s0-6 6-6c4 0 4.5 3.5 7.5 3.5 4 0 4-3.5 4-3.5H22s0 6-6 6c-4 0-5.5-3.5-7.5-3.5-4 0-4 3.5-4 3.5H2"/></svg>';
  musicOption.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M 21 0 L 8 4.625 C 7.449219 4.808594 7 5.417969 7 5.96875 L 7 17.78125 C 6.546875 17.707031 6.035156 17.714844 5.5 17.84375 C 3.566406 18.316406 2 20.0625 2 21.71875 C 2 23.375 3.566406 24.316406 5.5 23.84375 C 7.410156 23.378906 8.960938 21.699219 9 20.0625 C 9 20.042969 9 20.019531 9 20 L 9 8.28125 L 20 4.34375 L 20 14.78125 C 19.546875 14.707031 19.035156 14.714844 18.5 14.84375 C 16.566406 15.316406 15 17.0625 15 18.71875 C 15 20.375 16.566406 21.316406 18.5 20.84375 C 20.433594 20.371094 22 18.65625 22 17 L 22 1 C 22 0.449219 21.550781 0 21 0 Z"></path></svg>';

  optionsContainer.insertBefore(musicOption, options[options.length - 1]);
  optionsContainer.insertBefore(newOption, options[options.length - 1]);

  const modalOverlay = document.getElementById("modal-overlay");
  const optionModals = modalOverlay.childNodes;
  const newOptionsMenu = document.createElement("div");
  newOptionsMenu.id = "megukascript-options";
  newOptionsMenu.style.display = "none";

  // mimics class from other overlays
  modalOverlay.children[0].classList.forEach(c =>
    newOptionsMenu.classList.add(c)
  );
  modalOverlay.appendChild(newOptionsMenu);

  // Add click listener to self button
  newOption.onclick = () => {
    optionModals.forEach(modal => {
      if (modal.id !== "megukascript-options") modal.style.display = "none";
    });
    newOptionsMenu.style.display =
      newOptionsMenu.style.display === "none" ? "block" : "none";
  };

  // Add functionality to MMP button
  musicOption.onclick = () => {
    document.getElementById("megucaplayerOption").click();
  };

  // Add hide click listener to other buttons
  Array.from(options).forEach(option => {
    if (option.id !== "banner-megukascript-options")
      option.addEventListener("click", () => {
        newOptionsMenu.style.display = "none";
      });
  });

  addOptionMenuButts(newOptionsMenu);
  addExtraConfig();
}

function addOptionMenuButts(parent) {
  const buttHeader = document.createElement("div");
  const divider = document.createElement("hr");
  const tabContainer = document.createElement("div");

  parent.appendChild(buttHeader);
  parent.appendChild(divider);
  parent.appendChild(tabContainer);

  Object.keys(optionsDescription).forEach((optionTab, index) => {
    buttHeader.appendChild(
      createMenuButt(buttHeader, tabContainer, optionTab, index)
    );
    tabContainer.appendChild(
      createMenuTabContent(tabContainer, optionTab, index)
    );
  });
}

// ahn~
function createMenuButt(parent, tabParent, buttName, butt_id) {
  const butt = document.createElement("a");
  butt.classList.add("tab-link");
  butt.innerHTML = buttName;
  if (butt_id === 0) butt.classList.add("tab-sel");
  butt.style.padding = "7px";

  attr = document.createAttribute("data-id");
  attr.value = butt_id;
  butt.setAttributeNode(attr);

  butt.onclick = () => {
    parent.querySelectorAll(".tab-sel").forEach(el => {
      el.classList.remove("tab-sel");
    });
    butt.classList.add("tab-sel");

    tabParent.childNodes.forEach(content => {
      // >That string comparison
      // Fuck JS tbh
      content.style.display =
        content.getAttribute("data-id") === "" + butt_id ? "block" : "none";
    });
  };

  return butt;
}

function createMenuTabContent(parent, tabName, tab_id) {
  const tabContent = document.createElement("div");
  tabContent.style.display = tab_id === 0 ? "block" : "none";

  const attr = document.createAttribute("data-id");
  attr.value = tab_id;
  tabContent.setAttributeNode(attr);

  tabItems = optionsDescription[tabName];
  tabItems.forEach(item => {
    if (item[0] === "text") tabContent.appendChild(createMenuText(item));
    if (item[0] === "checkbox")
      tabContent.appendChild(createMenuCheckBox(item));
    if (item[0] === "input") tabContent.appendChild(createMenuInput(item));
    if (item[0] === "textarea")
      tabContent.appendChild(createMenuTextArea(item));
    if (item[0] === "division")
      tabContent.appendChild(createElementFromHTML("<br/><hr/>"));
    if (item[0] === "fileInput")
      tabContent.appendChild(createMenuFileInput(item));
  });

  return tabContent;
}

function createElementFromHTML(htmlString) {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  return div;
}

function createMenuCheckBox(item) {
  const htmlString =
    '<input type="checkbox" name=' +
    item[1] +
    " id=" +
    item[1] +
    "> <label for=" +
    item[1] +
    ">" +
    item[2] +
    "</label><br>";
  const res = createElementFromHTML(htmlString);
  const inputEl = res.getElementsByTagName("input")[0];
  inputEl.checked = currentlyEnabledOptions.has(item[1]);

  if (item.length > 3) {
    const labelEl = res.getElementsByTagName("label")[0];
    const attrTitle = document.createAttribute("title");
    attrTitle.value = item[3];
    labelEl.setAttributeNode(attrTitle);
  }

  inputEl.onchange = () => {
    localStorage.setItem(item[1], inputEl.checked ? "on" : "off");
  };

  return res;
}

function createMenuText(item) {
  const p = document.createElement("p");
  p.innerHTML = item[1];

  return p;
}

function createMenuInput(item) {
  const buttonLabel = item.length > 5 ? item[5] : "Save";
  const buttonId = item.length > 6 ? item[6] : item[1] + "_button";
  const htmlString =
    '<label for="' +
    item[1] +
    '">' +
    item[3] +
    '</label><input type="textbox" name="' +
    item[1] +
    '" id="' +
    item[1] +
    '"/><button type="button" id="' +
    buttonId +
    '">' +
    buttonLabel +
    "</button><br>";
  const res = createElementFromHTML(htmlString);

  const inputEl = res.getElementsByTagName("input")[0];
  inputEl.value = item[2]();
  const buttonEl = res.getElementsByTagName("button")[0];
  buttonEl.onclick = () => {
    item[4](inputEl.value);
  };

  return res;
}

function createMenuTextArea(item) {
  const buttonLabel = item.length > 5 ? item[5] : "Save";

  const htmlString =
    '<label for="' +
    item[1] +
    '">' +
    item[3] +
    '</label><br/><textarea rows=4 cols=60 id="' +
    item[1] +
    '"></textarea><br/><button type="button" id="' +
    item[1] +
    '_button">' +
    buttonLabel +
    "</button><br>";
  const res = createElementFromHTML(htmlString);

  const inputEl = res.getElementsByTagName("textarea")[0];
  inputEl.value = item[2]();
  const buttonEl = res.getElementsByTagName("button")[0];
  buttonEl.onclick = () => {
    item[4](inputEl.value);
  };

  return res;
}

function createMenuFileInput(item) {
  const htmlString =
    '<input name="' + item[1] + '" id="' + item[1] + '" type="file">';
  return createElementFromHTML(htmlString).firstChild;
}

function addExtraConfig() {
  // For meguca player
  document.getElementById("megucaplayerOption").onclick = mgcPl_optionClicked;

  // For sekritposting nice enter key listening
  document
    .querySelector("#hidetext")
    .addEventListener("keyup", function(event) {
      if (event.key !== "Enter") return; // Use `.key` instead.
      document.querySelector("#secretButton").click(); // Things you want to do.
      event.preventDefault(); // No need to `return false;`.
    });

  // Extra config for imgsekritposting
  document.getElementById("hidetext").addEventListener("paste", function(e) {
    var files = e.clipboardData.files;
    // check if a file was pasted
    if (files.length == 1) {
      var secretImage = document.getElementById("secret_image");

      if (secretImage != undefined) {
        secretImage.files = files;
        secretImage.javascriptIsFuckingDumb = files[0]; // secretImage.files seems to get cleared automatically
        e.stopPropagation();
      }
    }
  });
}

function insertCuteIntoCSS() {
  var css = document.createElement("style");
  css.type = "text/css";
  // calculate lengths
  css.innerHTML =
    ".sekrit_text { color: #FFDC91; }" +
    ".lewd_color { animation: lewd_blinker 0.7s linear " +
    getIterations(0.7) +
    "; color: pink; } @keyframes lewd_blinker { 50% { color: #FFD6E1 } }" +
    ".decision_roll { animation: decision_blinker 0.4s linear 2; color: lightgreen; } @keyframes decision_blinker { 50% { color: green } }" +
    ".planeptune_wins { animation: planeptune_blinker 0.6s linear " +
    getIterations(0.6) +
    "; color: mediumpurple; } @keyframes planeptune_blinker { 50% { color: #fff} }" +
    ".lastation_wins { animation: lastation_blinker 0.6s linear " +
    getIterations(0.6) +
    "; color: #000; } @keyframes lastation_blinker { 50% { color: #fff} }" +
    ".lowee_wins { animation: lowee_blinker 0.6s linear " +
    getIterations(0.6) +
    "; color: #e6e6ff; } @keyframes lowee_blinker { 50% { color: #c59681 }}" +
    ".leanbox_wins { animation: leanbox_blinker 0.6s linear " +
    getIterations(0.6) +
    "; color: #4dff4d; } @keyframes leanbox_blinker { 50% { color: #fff} }" +
    ".thousand_pyu { animation: pyu_blinker 0.4s linear " +
    getIterations(0.4) +
    "; color: aqua; } @keyframes pyu_blinker { 50% { color: white } }" +
    ".filtered :not(.filter-stub) { display: none }" +
    ".shaking_post { animation: screaming 0.5s linear 0s " +
    getVibrationIterations() +
    "; } @keyframes screaming { 0% { -webkit-transform: translate(2px, 1px) rotate(0deg); } 10% { -webkit-transform: translate(-1px, -2px) rotate(-1deg); } 20% { -webkit-transform: translate(-3px, 0px) rotate(1deg); } 30% { -webkit-transform: translate(0px, 2px) rotate(0deg); } 40% { -webkit-transform: translate(1px, -1px) rotate(1deg); } 50% { -webkit-transform: translate(-1px, 2px) rotate(-1deg); } 60% { -webkit-transform: translate(-3px, 1px) rotate(0deg); } 70% { -webkit-transform: translate(2px, 1px) rotate(-1deg); } 80% { -webkit-transform: translate(-1px, -1px) rotate(1deg); } 90% { -webkit-transform: translate(2px, 2px) rotate(0deg); } 100% { -webkit-transform: translate(1px, -2px) rotate(-1deg); } }";
  document.head.appendChild(css);
}

function getIterations(period) {
  if (flashingDuration == "infinite") {
    return 60 / period;
  }
  return flashingDuration / period;
}

function getVibrationIterations() {
  if (vibrationDuration == "infinite") {
    return 120;
  }
  return vibrationDuration * 2;
}

function getCurrentOptions() {
  Object.keys(optionsDescription).forEach(optionsTab => {
    optionsDescription[optionsTab].forEach(item => {
      if (item[0] === "checkbox") {
        const id = item[1];
        const setting = localStorage.getItem(id);
        if (setting !== "off") currentlyEnabledOptions.add(id);
      }
    });
  });

  flashingDuration = parseFloat(localStorage.getItem("flashing"));
  if (isNaN(flashingDuration)) {
    // assume inifinity if it's not a number
    flashingDuration = "infinite";
  }

  vibrationDuration = parseFloat(localStorage.getItem("vibration"));
  if (isNaN(vibrationDuration)) {
    // assume inifinity if it's not a number
    vibrationDuration = "infinite";
  }

  chuuCount = parseInt(localStorage.getItem("chuuCount"));
  if (isNaN(chuuCount)) chuuCount = 0;

  var filters = localStorage.getItem("customFilterText");
  if (filters != undefined) {
    customFilterText = filters;
    setupFilters();
  }
}

function setupFilters() {
  var filters = customFilterText.split("\n");
  for (var i = 0; i < filters.length; i++) {
    var filter = filters[i];
    if (filter.startsWith("#")) {
      // ignore comments
      continue;
    }
    if (filter == "") {
      // ignore empty lines
      continue;
    }
    // check what kind of filter this is, default to checking post text
    var type = "text";
    for (var potentialType of filterTypes.keys()) {
      if (filter.startsWith(potentialType + ":")) {
        type = potentialType;
        filter = filter.substring(potentialType.length + 1);
        break;
      }
    }
    var reg;
    try {
      reg = new RegExp(filter);
    } catch (e) {
      // anon is a baka
      console.log(e);
      continue;
    }
    customFilters.push([type, reg]);
  }
}

// For most new features, you'll want to put a call to your function in this function
// This will be called multiple times per post, so handlers should be idempotent
function handlePost(post) {
  if (currentlyEnabledOptions.has("sekritPosting")) {
    var secret = findMultipleShitFromAString(
      post.innerHTML,
      /<code class=\"code-tag\"><\/code><del>([^#<>\[\]]*)<\/del><code class=\"code-tag\"><\/code>/g
    );
    for (var j = secret.length - 1; j >= 0; j--) {
      parseSecretPost(post, secret[j]);
    }
    var secretQuote = findMultipleShitFromAString(
      post.innerHTML,
      /[ >]󠁂&gt;󠁂&gt;([\d]+)(?:[ <]+)/g
    );
    for (var j = secretQuote.length - 1; j >= 0; j--) {
      parseSecretQuote(post, secretQuote[j]);
    }
  }
  if (currentlyEnabledOptions.has("sharesOption")) {
    var shares = findMultipleShitFromAString(
      post.innerHTML,
      /\[([^\]\[]*)\] <strong( class=\"\w+\")?>#(\d+)d(\d+) \(([\d +]* )*= (?:\d+)\)<\/strong>/g
    );
    for (var j = shares.length - 1; j >= Math.max(0, shares.length - 4); j--) {
      parseShares(post, shares[j]);
    }
  }
  if (currentlyEnabledOptions.has("pyuOption")) {
    var pyu = findMultipleShitFromAString(
      post.innerHTML,
      /<strong>#pyu \(([\d+]*)\)<\/strong>/g
    );
    for (var j = pyu.length - 1; j >= 0; j--) {
      parsePyu(post, pyu[j]);
    }
  }
  if (currentlyEnabledOptions.has("mathOption")) {
    var math = findMultipleShitFromAString(
      post.innerHTML,
      /#math\(((?:[\d-+/*%().^ ]*(?:log)*)*)\)/g
    );
    for (var j = math.length - 1; j >= 0; j--) {
      parseMath(post, math[j]);
    }
  }
  if (currentlyEnabledOptions.has("chuuOption")) {
    var chuu = findMultipleShitFromAString(
      post.innerHTML,
      /#chuu\( ?(\d*) ?\)/g
    );
    for (var j = chuu.length - 1; j >= 0; j--) {
      parseChuu(post, chuu[j]);
    }
  }
  if (currentlyEnabledOptions.has("decideOption")) {
    var decide;
    decide = findMultipleShitFromAString(
      post.innerHTML,
      /\[([^#\]\[]*)\]\s<strong( class=\"\w+\")?>#d([0-9]+) \(([0-9]+)\)<\/strong>/g
    );
    for (var j = decide.length - 1; j >= 0; j--) {
      parseDecide(post, decide[j], false);
    }

    decide = findMultipleShitFromAString(
      post.innerHTML,
      /(?:<blockquote>|<br>)([^><]*)(\s|<br>)<strong( class=\"\w+\")?>#d([0-9]+) \(([0-9]+)\)<\/strong>/g
    );
    for (var j = decide.length - 1; j >= 0; j--) {
      parseDecide(post, decide[j], true);
    }
  }
  if (currentlyEnabledOptions.has("dumbPosters")) {
    checkForDumbPost(post);
  }
  if (currentlyEnabledOptions.has("screamingPosters")) {
    checkForScreamingPost(post);
  }
  if (currentlyEnabledOptions.has("showDeletedPosts")) {
    showDeletedPost(post);
  }
  if (currentlyEnabledOptions.has("showWhoDeletedPosts")) {
    checkForDeletedOrBannedPost(post);
  }
  if (currentlyEnabledOptions.has("filterPosts")) {
    filterPost(post);
  }
}

function readPostsForData() {
  var posts = document.getElementsByClassName("post-container");
  for (var i = 0; i < posts.length; i++) {
    var post = posts[i];
    handlePost(post);
  }
}

function parsePyu(post, pyu) {
  var n = pyu[1];
  var before = post.innerHTML.substring(0, pyu.index);
  var after = post.innerHTML.substring(pyu.index + pyu[0].length);

  if (n % 1000 == 0) {
    var pyuHTML =
      '<strong class="thousand_pyu"> 💦 ' + pyu[0].substring(8) + " 💦 ";
    post.innerHTML = before + pyuHTML + after;
  }
}

function parseMath(post, math) {
  var expr = math[1];
  expr = parseMath_addPow(expr).replace(/log/g, "Math.log");
  var result;
  try {
    result = eval(expr);
  } catch (err) {
    result = "???";
  }
  if (isNaN(result)) result = "???";

  var before = post.innerHTML.substring(0, math.index);
  var after = post.innerHTML.substring(math.index + math[0].length);
  var mathHTML =
    "<strong>" +
    math[0].substring(0, 5) +
    " " +
    math[0].substring(5, math[0].length - 1) +
    " = " +
    result +
    ")</strong>";
  post.innerHTML = before + mathHTML + after;
}

function parseMath_addPow(str) {
  for (let i = str.length - 1; i >= 0; i--) {
    if (str[i] !== "^") continue;
    let parentheses = 0;
    const operators = /[-+*/%^]/;

    // looking ahead
    let j;
    for (j = i + 1; j < str.length; j++) {
      if (str[j] === "(") parentheses++;
      else if (str[j] === ")" && parentheses > 0) parentheses--;
      else if (operators.test(str[j]) && parentheses === 0) break;
    }
    // j is just after the term

    // looking back
    let k;
    parentheses = 0; // so it doesn't break even more stuff;
    for (k = i - 1; k >= 0; k--) {
      if (str[k] === ")") parentheses++;
      else if (str[k] === "(" && parentheses > 0) parentheses--;
      else if (operators.test(str[k]) && parentheses === 0) break;
    }
    // k is just before the term
    k++; // k is on the beginning of the term

    str =
      str.substring(0, k) +
      "Math.pow(" +
      str.substring(k, i) +
      "," +
      str.substring(i + 1, j) +
      ")" +
      str.substring(j);
    i += 9; // Due to the addition of "pow(" before i
  }

  return str;
}

function parseChuu(post, chuu) {
  var postNum = chuu[1];
  var kissedPost = document.getElementById("p" + postNum);

  if (kissedPost === null || kissedPost === undefined) return;

  var nametag = kissedPost.querySelector("header").getElementsByTagName("B")[0];

  var before = post.innerHTML.substring(0, chuu.index);
  var after = post.innerHTML.substring(chuu.index + chuu[0].length);
  var chuuHTML = "<strong";

  // Has an (You) => You've been kissed!
  if (nametag.getElementsByTagName("I").length > 0) {
    var ownName = post.parentNode
      .querySelector("header")
      .getElementsByTagName("B")[0];
    // Don't chuu yourself
    if (ownName.getElementsByTagName("I").length > 0) return;

    chuuHTML += ' class="lewd_color"';
    chuuCount = localStorage.getItem("chuuCount", chuuCount);
    chuuCount++;
    localStorage.setItem("chuuCount", chuuCount);
    document.getElementById("chuu-counter").innerHTML = chuuCount;

    var message = "chuu~";
    if (chuuCount % 10 === 0) {
      message +=
        "\nCongratulations on your pregnancy!\nYou now have " +
        chuuCount / 10 +
        " children!";
    }

    alert(message);
  }

  chuuHTML += ">#chuu~(" + chuu[1] + ")</strong>";
  post.innerHTML = before + chuuHTML + after;
}

function parseDecide(post, decide, isSmart) {
  var offset = isSmart ? 1 : 0;

  var options = decide[1].split(",");
  var n = decide[3 + offset];
  var m = decide[4 + offset];

  var before = post.innerHTML.substring(0, decide.index);
  var after = post.innerHTML.substring(decide.index + decide[0].length);

  if (options.length != n || n == 1) return;
  options[m - 1] =
    '<strong class="decision_roll">' + options[m - 1] + "</strong>";
  var newInner = options.toString();
  var retreivedRoll;
  if (decide[2 + offset] == null) {
    retreivedRoll = " <strong>#d" + n + " (" + m + ")</strong>";
  } else {
    retreivedRoll =
      " <strong" + decide[2 + offset] + ">#d" + n + " (" + m + ")</strong>";
  }

  if (isSmart) {
    if (decide[0].substring(0, 3) === "<br") before += "<br>";
    else before += "<blockquote>";

    newInner += decide[2];
  }

  post.innerHTML = before + newInner + retreivedRoll + after;
}

function parseShares(post, shares) {
  var options = shares[1].split(",");
  var n = shares[3];
  var maxShares = shares[4];
  var shareValues = shares[5].split(" + ");
  for (var j = 0; j < shareValues.length; j++) {
    shareValues[j] = Number(shareValues[j]); //Because FUCK YOU FUCKING JAVASCRIPT END YOURSELF YOU SHIT AAAAAAAAAAAAAAAA FUCK
  }

  var before = post.innerHTML.substring(0, shares.index);
  var after = post.innerHTML.substring(shares.index + shares[0].length);
  var highestValue = Math.max.apply(Math, shareValues);

  if (options.length != n || n == 1 || n == 0) return;

  for (var j = 0; j < shareValues.length; j++) {
    var formattedRoll = " (" + shareValues[j] + "/" + maxShares + ")";

    // format the options
    if (shareValues[j] == highestValue) {
      if (options[j].match(/(^|\W)planeptune($|\W)(?!\w)/i)) {
        options[j] =
          '</strong><strong class="planeptune_wins">' +
          options[j] +
          formattedRoll +
          "</strong><strong>";
      } else if (options[j].match(/(^|\W)lastation($|\W)(?!\w)/i)) {
        options[j] =
          '</strong><strong class="lastation_wins">' +
          options[j] +
          formattedRoll +
          "</strong><strong>";
      } else if (options[j].match(/(^|\W)lowee($|\W)(?!\w)/i)) {
        options[j] =
          '</strong><strong class="lowee_wins">' +
          options[j] +
          formattedRoll +
          "</strong><strong>";
      } else if (options[j].match(/(^|\W)leanbox($|\W)(?!\w)/i)) {
        options[j] =
          '</strong><strong class="leanbox_wins">' +
          options[j] +
          formattedRoll +
          "</strong><strong>";
      } else {
        options[j] =
          '</strong><strong class="decision_roll">' +
          options[j] +
          formattedRoll +
          "</strong><strong>";
      }
    } else {
      options[j] = options[j] + formattedRoll;
    }
  }

  var newInner = options.join("<br>");
  if (
    before.substring(before.length - 4) != "<br>" &&
    before.substring(before.length - 4) != "ote>"
  ) {
    before += "<br>";
  }
  if (after.substring(0, 4) != "<br>" && after.substring(0, 4) != "<blo") {
    after = "<br>" + after;
  }
  post.innerHTML = before + "<strong>" + newInner + "</strong>" + after;
}

function findMultipleShitFromAString(s, re) {
  var result = [];
  var m;
  while (true) {
    m = re.exec(s);
    if (m) result.push(m);
    else break;
  }
  return result;
}

// Observer watches the thread
function setObservers() {
  var thread = document.getElementById("thread-container");

  // configuration of the observers:
  var config = {
    attributes: true,
    childList: true,
    subtree: true,
    attributeOldValue: true
  };

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length == 0) {
        if (
          mutation.type == "attributes" &&
          mutation.attributeName == "class"
        ) {
          // check for existing posts that have changed, ie deleted/canceled/finished
          var post = mutation.target;
          var postContent = post.getElementsByClassName("post-container")[0];
          if (postContent != undefined) {
            if (currentlyEnabledOptions.has("showWhoDeletedPosts")) {
              checkForDeletedOrBannedPost(postContent);
            }
            if (currentlyEnabledOptions.has("showDeletedPosts")) {
              showDeletedPost(postContent);
            }
            if (currentlyEnabledOptions.has("cancelposters")) {
              // unhide removed posts, and restore their contents
              if (
                post.classList.contains("hidden") &&
                postContent.innerText == ""
              ) {
                // look for events that removed nodes
                var cancelled = false;
                for (var j = 0; j < mutations.length; j++) {
                  var removeEvt = mutations[j];
                  if (removeEvt.type == "childList") {
                    for (var i = 0; i < removeEvt.removedNodes.length; i++) {
                      var node = removeEvt.removedNodes[i];
                      // don't re-add the 'Hide, Report' menu if it disappeared
                      // or the post controls or editable textarea
                      if (
                        !(
                          (node.classList &&
                            node.classList.contains("popup-menu")) ||
                          node.id == "post-controls" ||
                          node.id == "text-input"
                        )
                      ) {
                        removeEvt.target.appendChild(removeEvt.removedNodes[i]);
                        cancelled = true;
                      }
                    }
                  }
                }

                // restore the post if it was probably cancelled
                if (cancelled) {
                  post.classList.remove("hidden");
                  post.style.opacity = "0.5";
                  // flag the post as cancelled so we add the correct 'dumb xposter' later
                  postContent.cancelled = true;
                  // somewhere along the way, the default image-hover listener breaks
                  // so just prevent it from running to avoid console errors
                  post.addEventListener("mousemove", function(e) {
                    e.stopPropagation();
                  });
                }
              }
            }
            // check for posts finishing
            // (the current user deadposting will have been 'reply-form' but not 'editing')
            if (
              (mutation.oldValue.split(" ").includes("editing") ||
                mutation.oldValue.split(" ").includes("reply-form")) &&
              !post.classList.contains("editing") &&
              !post.classList.contains("reply-form")
            ) {
              handlePost(postContent);
              if (currentlyEnabledOptions.has("enablemegucaplayer")) {
                mgcPl_addNewSong(post.getElementsByTagName("figcaption")[0]);
              }
            }
          }
        }
      } else {
        // check what was added
        var postItself;
        if (mutation.target.nodeName == "BLOCKQUOTE") {
          // could be updating the content of an existing post
          // try to find the post itself
          if (
            mutation.target.parentNode &&
            mutation.target.parentNode.parentNode &&
            mutation.target.parentNode.parentNode.nodeName == "ARTICLE"
          ) {
            postItself = mutation.target.parentNode.parentNode;
          }
        } else if (mutation.addedNodes[0].nodeName == "ARTICLE") {
          postItself = mutation.addedNodes[0];
        } else if (
          mutation.addedNodes[0].classList &&
          mutation.addedNodes[0].classList.contains("admin", "banned")
        ) {
          if (currentlyEnabledOptions.has("showWhoDeletedPosts")) {
            checkForDeletedOrBannedPost(mutation.target);
          }
        }

        if (postItself == undefined) {
          return;
        }
        var postContent = postItself.getElementsByClassName(
          "post-container"
        )[0];
        if (postContent == undefined) {
          return;
        }

        // still editing
        if (
          postItself.getAttribute("class").includes("editing") ||
          postItself.getAttribute("class").includes("reply-form")
        ) {
          // add Format button to posts the user is making
          if (postItself.getAttribute("class").includes("reply-form")) {
            if (currentlyEnabledOptions.has("annoyingFormatting"))
              addFormatButton(postItself);
            if (currentlyEnabledOptions.has("preSubmitOption"))
              overrideDoneButton(postItself);
          }
          // but don't do anything else to editing posts
          return;
        }
        // handlesPost (works for others' deadposts)
        handlePost(postContent);
        mgcPl_addNewSong(postItself.getElementsByTagName("figcaption")[0]);
      }
    });
  });

  // pass in the target node, as well as the observer options
  observer.observe(thread, config);

  if (currentlyEnabledOptions.has("imgsekritPosting")) {
    setupSecretObserver();
  }

  if (currentlyEnabledOptions.has("skeletonCount")) {
    var counter = document.getElementById("sync-counter");
    counter.title = "Unique connected IP human/skeleton count";
    var counterConfig = { childList: true };
    var counterObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        const reg = /(\d+) \/ (\d+)/;
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          var added = mutation.addedNodes[0];
          var oldText = added.textContent;
          var matches = oldText.match(reg);
          if (matches.length == 3) {
            var humans = parseInt(matches[1]);
            var total = parseInt(matches[2]);
            var skeletons = total - humans;
            var s1 = humans == 1 ? " human / " : " humans / ";
            var s2 = skeletons == 1 ? " skeleton" : " skeletons";
            var newText;
            if (currentlyEnabledOptions.has("skeletonLabels")) {
              newText = humans + s1 + skeletons + s2;
            } else {
              newText = humans + " / " + skeletons;
            }
            added.textContent = newText;
          }
        }
      });
    });
    counterObserver.observe(counter, counterConfig);
  }
}

function addFormatButton(post) {
  if (document.getElementById("format-button")) {
    // button already exists
    return;
  }
  var button = document.createElement("input");
  button.name = "format";
  button.value = "Format";
  button.type = "button";
  button.id = "format-button";
  button.onclick = formatPostText;

  var controls = document.getElementById("post-controls");
  controls.appendChild(button);
}

function formatPostText() {
  var input = document.getElementById("text-input");
  input.value = input.value
    .split(" ")
    .map(formatWord)
    .join(" ");
  var evt = document.createEvent("HTMLEvents");
  evt.initEvent("input", false, true);
  input.dispatchEvent(evt);
}

function formatWord(s) {
  // pick a random format and add it to both sides of the word
  var format = ["~~", "**", "@@", "``"][Math.floor(Math.random() * 4)];
  return format + s + format;
}

function setUpEdenBanner() {
  var banner = document.getElementById("banner-center");
  banner.innerHTML =
    '<a href="http://edenofthewest.com/" target="_blank">[synced] DJ</a>&nbsp;&nbsp;<a title="Click to google song" href="https://www.google.com.br/search?q=gomin" target="_blank"><b>Song</b></a></b>';
  getInfoFromEden();
  window.setInterval(getInfoFromEden, 10000);
}

function getInfoFromEden() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      updateEdenBanner(JSON.parse(this.responseText));
    }
  };
  xhttp.open("GET", "https://edenofthewest.com/ajax/status.php", true);
  xhttp.send();
}

function updateEdenBanner(edenJSON) {
  var banner = document.getElementById("banner-center");
  var djInfo = banner.children[0];
  var songInfo = banner.children[1];

  djInfo.innerHTML = "[" + edenJSON.listeners + "] " + edenJSON.dj;
  songInfo.href =
    "https://www.google.com.br/search?q=" +
    encodeURIComponent(edenJSON.current);
  songInfo.innerHTML = "<b>" + edenJSON.current + "</b>";
}

function checkForDumbPost(post) {
  // cancelposters
  if (post.cancelled) {
    addToName(post, " (dumb cancelposter)");
    return;
  }
  var text = post.textContent;
  // ~posters
  if (text.match("~") != null) {
    addToName(post, " (dumb ~poster)");
    return;
  }
  // Blancposters
  if (
    (text == "" || text == " ") &&
    post.getElementsByTagName("figure").length == 0
  ) {
    var quality = currentlyEnabledOptions.has("dumbblanc") ? "dumb" : "cute";
    addToName(post, " (" + quality + " blancposter)");
    return;
  }
  // dumbposterposters
  var dumbRegex = /^(?:>>\d* (?:\(You\) )?# )*(dumb ?.{0,20}posters?)$/i;
  if (text.match(dumbRegex) != null) {
    var posterType = text.match(dumbRegex)[1];
    addToName(post, " (dumb '" + posterType + "' poster)");
    return;
  }
  // cuteposterposters
  var cuteRegex = /^(?:>>\d* (?:\(You\) )?# )*(cute ?.{0,20}posters?)$/i;
  if (text.match(cuteRegex) != null) {
    var posterType = text.match(cuteRegex)[1];
    addToName(post, " (cute '" + posterType + "' poster)");
    return;
  }
  // wait anon
  if (text.match(/^(?:>>\d* (?:\(You\) )?# )*wait anon$/i) != null) {
    addToName(
      post,
      " (Dumb haiku poster / 'wait anon' is all she says / Don't wait, run away!)"
    );
    return;
  }
  // virus post
  if (text.match(/virus/i) != null) {
    addToName(post, " (virus post do not read)");
    return;
  }
  // lowercaseposters
  var uppers = findMultipleShitFromAString(text, /[A-Z]/g);
  var Yous = findMultipleShitFromAString(text, />>\d* \(You\)/g);
  if (uppers.length == Yous.length) {
    var lowers = findMultipleShitFromAString(text, /[a-z]/g);
    if (lowers.length >= 5) {
      addToName(post, " (dumb lowercaseposter)");
      return;
    }
  }
  addToName(post, "");
}

function checkForScreamingPost(post) {
  var text = post.textContent;
  var wholePost = post.parentElement;

  // Remove (references, Yous and spaces)
  text = text
    .replace(/(?:>>\d* (?:\(You\) )?#)/g, "")
    .replace(/(?:>>\d*)/g, "")
    .replace(/[\s\W\d_]/g, "");

  var isBlanc = text.length == 0;
  var hasLower = text.match("[a-z]");
  var isShort = text.length <= 5;
  if (
    !isShort &&
    !isBlanc &&
    !hasLower &&
    !wholePost.className.match("shaking_post")
  ) {
    wholePost.className += " shaking_post";
  }
}

function addToName(post, message) {
  var name = post.parentNode.getElementsByClassName("name spaced")[0];
  var newText = document.createTextNode(message);
  newText.id = "dumbposter";
  // remove existing names
  name.parentNode.childNodes.forEach(node => {
    if (node.id == "dumbposter") {
      name.parentNode.removeChild(node);
    }
  });
  name.parentNode.insertBefore(newText, name.nextSibling);
}

function filterPost(postContent) {
  var post = postContent.parentNode;
  if (
    post.classList.contains("filtered") ||
    post.classList.contains("filtered-shown")
  ) {
    return;
  }
  for (var i = 0; i < customFilters.length; i++) {
    var filter = customFilters[i];
    var type = filter[0];
    var reg = filter[1];
    var textToMatch;
    var selector = filterTypes.get(type);
    var elt = post.querySelector(selector);
    if (elt != null) {
      // flags don't have text, so use the title instead
      if (type == "flag") {
        textToMatch = elt.title;
      } else {
        textToMatch = elt.innerText;
      }
    }
    if (textToMatch != undefined && textToMatch.match(reg)) {
      post.classList.add("filtered");
      var stub = document.createElement("div");
      stub.classList.add("filter-stub");
      var name = filter[1].toString();
      name = name.substring(1, name.length - 1); // strip the /s
      stub.innerText = "Post filtered (" + filter[0] + ":" + name + ")";
      stub.onclick = showFilteredPost;
      post.appendChild(stub);
    }
  }
}

function showFilteredPost() {
  var post = this.parentNode;
  if (post.classList.contains("filtered")) {
    post.classList.remove("filtered");
    post.classList.add("filtered-shown");
  } else {
    post.classList.remove("filtered-shown");
    post.classList.add("filtered");
  }
}

function setup() {
  getCurrentOptions();
  insertCuteIntoCSS();
  readPostsForData();
  if (document.getElementById("thread-container") != null) setObservers();
  addScriptOptionMenu();
  if (currentlyEnabledOptions.has("enablemegucaplayer")) mgcPl_setupPlaylist();
  if (currentlyEnabledOptions.has("edenOption")) setUpEdenBanner();
  if (currentlyEnabledOptions.has("showDeletedPosts"))
    watchSocketForPostsDeletedOnCreation();
}

function downloadAll(value) {
  var posts = document.getElementById("thread-container").children;
  var filetypes = value.split(" ");
  for (var i = 0; i < posts.length; i++) {
    if (
      posts[i].tagName.toLowerCase() === "article" &&
      posts[i].querySelector("figcaption") != null
    ) {
      var anchor = posts[i].querySelector("figcaption").children[3];
      for (var j = 0; j < filetypes.length; j++)
        if (anchor.href.endsWith(filetypes[j])) anchor.click();
    }
  }
}

// override #d7777(7777)
function overrideDoneButton(postItself) {
  if (document.getElementById("overrided-done-button")) {
    // button already exists
    return;
  }

  var button = document.createElement("input");
  button.name = "over-done";
  button.value = "Done";
  button.type = "button";
  button.id = "overrided-done-button";
  button.onclick = editPostAndSubmit;

  var controls = document.getElementById("post-controls");
  controls.children[0].style.display = "none";
  controls.insertBefore(button, controls.children[0].nextSibling);
}

function editPostAndSubmit() {
  var input = document.getElementById("text-input");
  handlePreSubmit(input);
  var evt = document.createEvent("HTMLEvents");
  evt.initEvent("input", false, true);
  input.dispatchEvent(evt);
  document.getElementById("post-controls").children[0].click();
}

// All functions here must edit "input.value". This is the post written content.
function handlePreSubmit(input) {
  // Put memes here
}

var modlog;
var fetchingModlog = false;
var postsToCheck = [];
var postsToCheckAgain = [];

function watchSocketForPostsDeletedOnCreation() {
  var w = window.unsafeWindow;
  w.define(
    "userslut",
    ["require", "exports", "connection/messages", "client"],
    function(require, exports, message, client) {
      function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
      }
      Object.defineProperty(exports, "__esModule", { value: true });
      var oldHandler = message.handlers[1];
      // listen to create post messages
      message.handlers[1] = function(data) {
        oldHandler(data);
        if (
          data.moderation &&
          data.moderation.length &&
          data.moderation.length > 0
        ) {
          for (var i = 0; i < data.moderation.length; i++) {
            var m = data.moderation[i];
            if (m.type == 2) {
              // post was deleted
              addDeletedMessage(document.getElementById("p" + data.id), m.by);
            }
          }
        }
      };
    }
  );
  // this doesn't seem to work if I call it immediatally, so wait a few seconds for things to finish loading
  setTimeout(function() {
    w.require(["userslut"], function(a) {}, "a", false, undefined);
  }, 5000);
}

function shouldHandleDeleted(post) {
  return (
    post.parentNode.classList.contains("deleted") &&
    post.parentNode.querySelector(':scope > text[style="color: red;"]') == null
  );
}

function shouldHandleBanned(post) {
  return (
    post.querySelector(".admin.banned:not(.banMessage)") != null &&
    post.querySelector(".banMessage") == null
  );
}

function checkForDeletedOrBannedPost(post) {
  if (shouldHandleDeleted(post) || shouldHandleBanned(post)) {
    if (modlog == undefined && !fetchingModlog) {
      //get it now
      fetchModlog();
      postsToCheck.push(post);
    } else if (modlog != undefined && !fetchingModlog) {
      // use existing data
      postsToCheck.push(post);
      updateDeletedPosts();
    } else {
      // just queue up checking
      postsToCheck.push(post);
    }
  }
}

function fetchModlog() {
  fetchingModlog = true;
  var baseURL = new URL(window.location).origin;
  var board = window.location.pathname.split("/")[1];
  var url = new URL("/html/mod-log/" + board, baseURL);
  GM_xmlhttpRequest({
    method: "GET",
    url: url,
    responseType: "text",
    onload: function(response) {
      modlog = response.responseText;
      fetchingModlog = false;
      updateDeletedPosts();
    }
  });
}

function updateDeletedPosts() {
  // more posts may have been deleted while we were fetching the mod log
  // so if we don't find a post, check it again after re-fetching the mod log
  checkForPostInModlog(postsToCheckAgain);
  postsToCheckAgain = checkForPostInModlog(postsToCheck);
  postsToCheck = [];
  if (!fetchingModlog && postsToCheckAgain.length > 0) {
    fetchModlog();
  }
}

function addDeletedMessage(entirePost, by) {
  var delNode = entirePost.getElementsByClassName("deleted-toggle")[0];
  if (delNode != undefined) {
    // add the text below the deleted icon
    var txt = document.createElement("text");
    txt.innerHTML = "Deleted by " + by;
    txt.style.color = "red";
    delNode.parentNode.insertBefore(txt, delNode.nextSibling);
  }
}

function checkForPostInModlog(posts) {
  var result = [];
  for (var i = 0; i < posts.length; i++) {
    var post = posts[i];
    var id = post.parentNode.id.substring(1);
    var retry = false;
    if (shouldHandleDeleted(post)) {
      var matches = modlog.match(
        new RegExp(
          '<td>Delete post</td><td>([^<]*)</td><td><a class="post-link" data-id="' +
            id +
            '"'
        )
      );
      // posts deleted a long time ago may no longer have entries in the mod-log
      if (matches != null && matches[1] != undefined) {
        addDeletedMessage(post.parentNode, matches[1]);
      } else {
        retry = true;
      }
    }
    if (shouldHandleBanned(post)) {
      var banNode = post.querySelector(".admin.banned:not(.banMessage)");
      //Type By Post Time Reason Duration
      var banMatches = modlog.match(
        new RegExp(
          "<td>Ban</td>" +
            "<td>((?:(?!</td>).)+)</td>" +
            '<td><a class="post-link" data-id="' +
            id +
            '"(?:(?!</td>).)+</td>' +
            "<td>(?:(?!</td>).)+</td>" +
            "<td>((?:(?!</td>).)+)</td>" +
            "<td>((?:(?!</td>).)+)</td>"
        )
      );
      // posts deleted a long time ago may no longer have entries in the mod-log
      if (
        banMatches != null &&
        banMatches[1] != undefined &&
        banNode != undefined
      ) {
        // add the text below the banned message
        var banTxt = document.createElement("b");
        banTxt.innerHTML =
          "<br>Banned by " +
          banMatches[1] +
          " for " +
          banMatches[2] +
          " (" +
          banMatches[3] +
          ")";
        banTxt.classList = "admin banned banMessage";
        banNode.parentNode.insertBefore(banTxt, banNode.nextSibling);
      } else {
        retry = true;
      }
    }
    if (retry) {
      result.push(post);
    }
  }
  return result;
}

function showDeletedPost(post) {
  var parent = post.parentNode;
  if (parent.classList.contains("deleted")) {
    parent.getElementsByClassName("deleted-toggle")[0].checked = true;
  }
}

function mgcPl_InsertHtmlAndCSS() {
  var css = document.createElement("style");
  css.type = "text/css";
  css.innerHTML = `#mgcPlFrame { position: fixed; top: 100px; left: ${window.innerWidth -
    400 -
    30}px; height: 300px; background-color: black; max-width: 400px;`;
  if (!currentlyEnabledOptions.has("megucaplayerOption"))
    css.innerHTML += " display: none;";
  css.innerHTML +=
    " }  .mgcPlPlaylist{ width: 100%; height: 85%; }  .mgcPlControls { height: 20px; width: 80px; }  .mgcPlOptions { display: flex; flex: 1; justify-content: center; width: 100%; }  .mgcPlTitle { color: white; padding: 0; margin: 0; width: 100%; text-align: center; }  .mgcPlSliders { display: flex; margin: 0 5px; }  .mgcPlSeeker { flex: 2; margin: 5px 5px; color: white; }  .mgcPlVolume { flex: 1; margin: 5px 5px; color: white; }";
  document.head.appendChild(css);

  var newdiv = document.createElement("div");
  newdiv.innerHTML =
    '<div id="mgcPlFrame">  <div class="mgcPlOptions2"> <div draggable="true" id="mgcPldragArea"> <p class="mgcPlTitle" id="mgcPlTitle">MegucaPlayer</p> <div class="mgcPlOptions"> <button class="mgcPlControls" id="mgcPlPrevBut">prev</button> <button class="mgcPlControls" id="mgcPlStopBut">stop</button> <button class="mgcPlControls" id="mgcPlPlayBut">play/pause</button> <button class="mgcPlControls" id="mgcPlNextBut">next</button> </div> </div> <div class="mgcPlSliders"> <label class="mgcPlSeeker">Seeker: </label> <label class="mgcPlVolume">Volume: </label> </div> <div class="mgcPlSliders"> <input type="range" min="0" max="1" value="0" class="mgcPlSeeker" id="mgcPlSeekerSlider"> <input type="range" min="0" max="100" value="100" class="mgcPlVolume" id="mgcPlVolumeSlider"> </div> </div> <select class="mgcPlPlaylist" multiple id="megucaplaylist"> </select> </div>';
  document.body.appendChild(newdiv);
}

function mgcPl_optionClicked() {
  if (document.getElementById("megucaplayerOption").checked) {
    // Load songs and show
    var frame = document.getElementById("mgcPlFrame");
    frame.style.display = "unset";
    frame.style.top = "100px";
    frame.style.left = `${window.innerWidth - 400 - 30}px`;
    mgcPl_seekerBar_updater = setInterval(mgcPl_updateSeekerBar, 1000);
    if (mgcPl_currentIndex >= 0)
      document.getElementById(
        "megucaplaylist"
      ).selectedIndex = mgcPl_currentIndex;
  } else {
    document.getElementById("mgcPlFrame").style.display = "none";
    clearInterval(mgcPl_seekerBar_updater);
  }
}

var mgcPl_offset = [];
var mgcPl_songs = [];
var mgcPl_meguca_player;
var mgcPl_currentIndex = -1;
var mgcPl_volume = 1.0;
var mgcPl_seekerBar_updater;

function mgcPl_allowDrop(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
}

function mgcPl_drag(ev) {
  var frame = ev.target.parentNode.parentNode;
  ev.dataTransfer.setData("id", frame.id);
  var style = window.getComputedStyle(frame, null);
  mgcPl_offset[0] = parseInt(style.getPropertyValue("left"), 10) - ev.clientX;
  mgcPl_offset[1] = parseInt(style.getPropertyValue("top"), 10) - ev.clientY;
  frame.style.opacity = "0.6"; // this / e.target is the source node.
}

function mgcPl_drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("id");
  var thingy = document.getElementById(data);
  thingy.style.left = ev.clientX + parseInt(mgcPl_offset[0], 10) + "px";
  thingy.style.top = ev.clientY + parseInt(mgcPl_offset[1], 10) + "px";
  thingy.style.opacity = "1";
}

function mgcPl_playSelected() {
  mgcPl_play(document.getElementById("megucaplaylist").selectedIndex);
}

function mgcPl_play(selectedIndex) {
  // if different song, setups and play
  if (selectedIndex != mgcPl_currentIndex) {
    mgcPl_killPlayer();
    mgcPl_meguca_player = new Audio(mgcPl_songs[selectedIndex].link);
    mgcPl_currentIndex = selectedIndex;
    mgcPl_meguca_player.addEventListener("ended", function() {
      mgcPl_playSong(1);
    });
    mgcPl_meguca_player.volume = mgcPl_volume;

    // Seeker
    var seeker = document.getElementById("mgcPlSeekerSlider");
    seeker.min = 0;
    seeker.max = mgcPl_convertLengthToSecs(mgcPl_songs[selectedIndex].duration);
    seeker.value = 0;
  } else if (!mgcPl_meguca_player.paused) {
    // if just pausing, pause and return;
    document.getElementById(
      "mgcPlTitle"
    ).innerHTML = `MegucaPlayer (paused) | ${mgcPl_songs[selectedIndex].name}`;
    mgcPl_meguca_player.pause();
    return;
  }
  document.getElementById(
    "mgcPlTitle"
  ).innerHTML = `MegucaPlayer | ${mgcPl_songs[selectedIndex].name}`;
  mgcPl_meguca_player.play();
}

function mgcPl_stopPlayer() {
  if (mgcPl_meguca_player === null || mgcPl_meguca_player === undefined) return;

  mgcPl_meguca_player.pause();
  mgcPl_meguca_player.currentTime = 0;
}

function mgcPl_playSong(variation) {
  if (mgcPl_meguca_player !== null && mgcPl_meguca_player !== undefined) {
    mgcPl_meguca_player.pause();
    mgcPl_meguca_player.src = "";
  }
  var nextIndex = (mgcPl_currentIndex + variation) % mgcPl_songs.length;
  document.getElementById("megucaplaylist").selectedIndex = nextIndex;
  mgcPl_play(nextIndex);
}

function mgcPl_killPlayer() {
  if (mgcPl_meguca_player !== null && mgcPl_meguca_player !== undefined) {
    mgcPl_meguca_player.pause();
    mgcPl_meguca_player.src = "";
  }
}

function mgcPl_fetchAllSongs() {
  var fileinfos = document.getElementsByTagName("figcaption");
  for (var i = 0; i < fileinfos.length; i++) {
    mgcPl_addNewSong(fileinfos[i]);
  }
}

function mgcPl_addNewSong(figcaption) {
  if (figcaption === null || figcaption === undefined) return;

  var link = figcaption.children[3].href;
  // Small hack to avoid adding songs twice due to the observers
  if (
    mgcPl_songs.length > 0 &&
    link === mgcPl_songs[mgcPl_songs.length - 1].link
  )
    return;

  if (
    link.endsWith(".mp3") ||
    link.endsWith(".flac") ||
    link.endsWith(".mp4") ||
    link.endsWith(".ogg")
  ) {
    var songinfo = figcaption.children[2];

    // Let's all miss the times of when lat was organized
    // var artistSpan = songinfo.getElementsByClassName("media-artist")[0];
    // var titleSpan = songinfo.getElementsByClassName("media-title")[0];
    // var durationSpan = songinfo.getElementsByClassName("media-length")[0];

    // If songInfo has more than 4 children, the penultimate will be artist and the last title
    const artistSpan =
      songinfo.children.length > 4
        ? songinfo.children[songinfo.children.length - 2]
        : undefined;
    const titleSpan =
      songinfo.children.length > 4
        ? songinfo.children[songinfo.children.length - 1]
        : undefined;
    const durationSpan = songinfo.children[1];

    var name = "";
    if (artistSpan !== undefined && artistSpan.innerHTML !== "")
      name = artistSpan.innerHTML + " - "; // media artist
    if (titleSpan !== undefined && titleSpan.innerHTML !== "")
      name += titleSpan.innerHTML; // title
    if (name === "") name = figcaption.children[3].download; // download filename

    var duration = "00:00";
    if (durationSpan !== undefined) duration = durationSpan.innerHTML; // duration

    mgcPl_songs.push({ name, duration, link });

    var newOp = document.createElement("option");
    var songInfo = document.createTextNode(duration + " | " + name);
    newOp.appendChild(songInfo);

    var playlist = document.getElementById("megucaplaylist");
    playlist.appendChild(newOp);
  }
}

function mgcPl_setupPlaylist() {
  mgcPl_InsertHtmlAndCSS();
  var dm = document.getElementById("mgcPldragArea");
  dm.addEventListener("dragstart", mgcPl_drag, false);
  document.body.addEventListener("dragover", mgcPl_allowDrop, false);
  document.body.addEventListener("drop", mgcPl_drop, false);

  // buttons
  document.getElementById("mgcPlPrevBut").addEventListener("click", function() {
    mgcPl_playSong(-1);
  });
  document.getElementById("mgcPlStopBut").addEventListener("click", function() {
    mgcPl_stopPlayer();
  });
  document.getElementById("mgcPlPlayBut").addEventListener("click", function() {
    mgcPl_playSelected();
  });
  document.getElementById("mgcPlNextBut").addEventListener("click", function() {
    mgcPl_playSong(1);
  });
  document
    .getElementById("megucaplaylist")
    .addEventListener("dblclick", function() {
      mgcPl_playSelected();
    });

  // sliders
  var volumeSlider = document.getElementById("mgcPlVolumeSlider");
  volumeSlider.addEventListener("input", function() {
    mgcPl_updateVolume(this.value);
  });
  var seekerSlider = document.getElementById("mgcPlSeekerSlider");
  seekerSlider.addEventListener("input", function() {
    mgcPl_seekTo(this.value);
  });
  if (currentlyEnabledOptions.has("megucaplayerOption"))
    mgcPl_seekerBar_updater = setInterval(mgcPl_updateSeekerBar, 1000);

  mgcPl_fetchAllSongs();
}

function mgcPl_updateVolume(volume) {
  mgcPl_volume = volume / 100.0;
  if (mgcPl_meguca_player !== null && mgcPl_meguca_player !== undefined)
    mgcPl_meguca_player.volume = volume / 100.0;
}

function mgcPl_seekTo(time) {
  if (mgcPl_meguca_player !== null && mgcPl_meguca_player !== undefined)
    mgcPl_meguca_player.currentTime = time;
}

function mgcPl_convertLengthToSecs(string) {
  const midSign = string.indexOf(":");
  const minutes = parseInt(string.substring(0, midSign));
  const seconds = parseInt(string.substring(midSign + 1));
  return minutes * 60 + seconds;
}

function mgcPl_updateSeekerBar() {
  var slider = document.getElementById("mgcPlSeekerSlider");
  if (mgcPl_meguca_player === null || mgcPl_meguca_player === undefined)
    slider.value = 0;
  else slider.value = mgcPl_meguca_player.currentTime;
}

const nipponeseIndex = [
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんゃゅょ心無日口二手山木糸羽雨辵水金色何"
];

function secretButtonPressed() {
  var fileInput = document.getElementById("secret_image");
  var file = fileInput.files[0] || fileInput.javascriptIsFuckingDumb; // sometimes fileInput.files gets reset, so we keep a copy of the file in another property
  if (document.getElementById("text-input") != null) {
    if (!file) {
      // text only
      var text = btoa(
        unescape(encodeURIComponent(document.getElementById("hidetext").value))
      );
      document.getElementById("hidetext").value = "";
      for (var j = 0; j < nipponeseIndex[0].length; j++) {
        if (text.indexOf(nipponeseIndex[0][j]) != -1)
          text =
            nipponeseIndex[0][j] == "/" || nipponeseIndex[0][j] == "+"
              ? text.replace(
                  new RegExp("\\" + nipponeseIndex[0][j], "g"),
                  nipponeseIndex[1][j]
                )
              : text.replace(
                  new RegExp(nipponeseIndex[0][j], "g"),
                  nipponeseIndex[1][j]
                );
      }
      document.getElementById("text-input").value =
        document
          .getElementById("text-input")
          .value.substring(
            0,
            document.getElementById("text-input").selectionStart
          ) +
        "````**" +
        text +
        "**````\n" +
        document
          .getElementById("text-input")
          .value.substring(document.getElementById("text-input").selectionEnd);
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("input", false, true);
      document.getElementById("text-input").dispatchEvent(evt);
    } else {
      // encode text in an image
      var te = new TextEncoder();
      var hiddenText = document.getElementById("hidetext").value;
      if (te.encode(hiddenText).length > 999) {
        alert("secret text too long ;_;");
        return;
      }
      var len = te.encode(hiddenText).length.toString();
      if (len.length < 3) len = "0" + len;
      if (len.length < 3) len = "0" + len;

      hiddenText += len;
      hiddenText += "sekret";
      var fr = new FileReader();
      fr.onload = function() {
        var buffer = this.result;
        var newfile = new File([buffer, te.encode(hiddenText)], file.name);
        var realInput = document.querySelector("#post-controls [name=image]");

        // weird hacks to set our modified file
        // You can't set the files in a file input in javascript
        // But meguca's code has a reference to the file input
        // So fuck up the input object, then the browser will let us set `files` on it
        // And put back some functions which other parts of meguca's code needs
        var obj = new Object();
        var oldFns = realInput.__proto__;
        realInput.__proto__ = obj.__proto__;
        realInput.files = [newfile];
        realInput.style = { display: "block" };
        realInput.remove = oldFns.remove;
        realInput.matches = oldFns.matches;
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        oldFns.dispatchEvent.call(realInput, evt);

        // clean up
        fileInput.value = "";
        fileInput.javascriptIsFuckingDumb = undefined;
        document.getElementById("hidetext").value = "";
      };
      fr.readAsArrayBuffer(file);
    }
  }
}

function parseSecretPost(post, secret) {
  var text = secret[1];
  var before = post.innerHTML.substring(0, secret.index);
  var after = post.innerHTML.substring(secret.index + secret[0].length);

  for (var j = 0; j < nipponeseIndex[0].length; j++) {
    text = text.replace(
      new RegExp(nipponeseIndex[1][j], "g"),
      nipponeseIndex[0][j]
    );
  }

  var decodedMessage = "";
  try {
    decodedMessage = decodeURIComponent(escape(atob(text)));
  } catch (e) {
    return;
  }
  decodedMessage = decodedMessage.replace(new RegExp("<", "g"), "<󠁂");
  decodedMessage = decodedMessage.replace(new RegExp(">", "g"), "󠁂>");
  post.innerHTML =
    before + '<h class="sekrit_text">' + decodedMessage + "</h>" + after;
}

function parseSecretQuote(post, secretQuote) {
  var quote = secretQuote[1];
  var before2 = post.innerHTML.substring(0, secretQuote.index);
  var after2 = post.innerHTML.substring(
    secretQuote.index + secretQuote[0].length
  );
  if (
    secretQuote[0].substring(secretQuote[0].length - 1) == "<" ||
    secretQuote[0].substring(secretQuote[0].length - 1) == " "
  ) {
    after2 = secretQuote[0].substring(secretQuote[0].length - 1) + after2;
    secretQuote[0] = secretQuote[0].substring(0, secretQuote[0].length - 1);
  }
  quote =
    '<a class="post-link" data-id="' +
    quote +
    '" href="#p' +
    quote +
    '">&gt;&gt;' +
    quote +
    '</a><a class="hash-link" href="#p' +
    quote +
    '"> #</a>';
  post.innerHTML = before2 + " </h>" + quote + after2; //"<h class=sekrit_text> " +
}

function parseSecretImage(img, str) {
  // the message is added to the end of the image
  // image bytes
  // text of message
  // length of message
  // "secret"

  // check if this contains a secret message
  var header = str.substring(str.length - 6, str.length);
  if (header == "sekret") {
    // the next three characters represent the length
    var length = str.substring(str.length - 9, str.length - 6);
    length = parseInt(length, 10);
    if (isNaN(length)) {
      return null;
    }

    // convert the rest of the string into an arraybuffer
    var buf = new ArrayBuffer(str.length - 9);
    var bufView = new Uint8Array(buf);
    for (var i = 0; i < str.length - 9; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    // now read the message
    var td = new TextDecoder();
    var message = td.decode(buf.slice(buf.byteLength - length, buf.byteLength));
    addMessageToPost(img, message);
    return message;
  }
  return null;
}

function addMessageToPost(img, message) {
  // find the post(s) that had this image
  var baseURL = new URL(window.location).origin;
  var url = new URL(img.src, baseURL);
  var thumbs = document.querySelectorAll(
    "figure > a[href$='" + url.pathname + "']"
  );
  for (var i = 0; i < thumbs.length; i++) {
    var thumb = thumbs[i];
    // check if we've already added something
    if (thumb.parentNode.childElementCount == 1) {
      // add the text
      var text = document.createElement("text");
      text.className = "sekrit_text";
      text.textContent = message;
      thumb.parentNode.appendChild(text);
      handlePost(thumb.parentNode.parentNode); // Handlepost after adding the text
    }
  }
}

function setupSecretObserver() {
  var parsedImages = {}; // cache results so we don't re-parse images

  var secretConfig = { childList: true };
  var secretObserver = new MutationObserver(function(mutations) {
    var mutation = mutations[0]; // only 1 thing will be hovered at a time
    if (mutation.addedNodes.length > 0) {
      var img = mutation.addedNodes[0];
      if (img.nodeName != "IMG") return; // hovering over a post, not an image
      if (parsedImages[img.src] !== undefined) {
        // we've already parsed (or are parsing) this image
        // call addMessageToPost again in case the image was reposed in a new post
        if (parsedImages[img.src] !== null) {
          addMessageToPost(img, parsedImages[img.src]);
        }
      } else {
        img.onload = function() {
          // https://stackoverflow.com/questions/934012/get-image-data-in-javascript/42916772#42916772
          // it isn't possible to get the bytes of an existing image, so we need to request it again
          // wait until the image has loaded, so it will hopefully come from the cache
          // (in my testing, FF seems to always reload it over the network...)
          GM_xmlhttpRequest({
            method: "GET",
            url: img.src,
            responseType: "text",
            onload: function(response) {
              // max message length is 999 bytes + 9 byte header
              var str = response.responseText.substring(
                response.responseText.length - 1008,
                response.responseText.length
              );
              var msg = parseSecretImage(img, str);
              parsedImages[img.src] = msg;
            }
          });
        };
        parsedImages[img.src] = null; // set to null for now, will be filled in if there's a message
      }
    }
  });
  secretObserver.observe(
    document.getElementById("hover-overlay"),
    secretConfig
  );
}

setup();
