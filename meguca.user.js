// ==UserScript==
// @name        megucascript
// @namespace   megucasoft
// @description Does a lot of stuff
// @require     player.js
// @require     secret.js
// @require     deleted.js
// @include     https://meguca.org/*
// @include     https://chiru.no/*
// @connect     meguca.org
// @connect     chiru.no
// @version     3.7.1
// @author      medukasthegucas
// @grant       GM_xmlhttpRequest
// ==/UserScript==

const defaultFiletypes = ".jpg .png .gif";
var chuuCount = 0;

// Things the user can turn on or off, add your new feature to this list
// For more complicated options, add them to the hackLatsOptions and getCurrentOptions functions
const onOffOptions = [["edenOption", "Eden Now Playing Banner"],
                      ["pyuOption", "Pyu Coloring~"],
                      ["decideOption", "Decision Coloring"],
                      ["dumbPosters", "Dumb xposters"],
                      ["dumbblanc", "dumb blancposters, not cute"],
                      ["sharesOption", "Shares Formatting"],
                      ["screamingPosters", "Vibrate screaming posts"],
                      ["sekritPosting", "Secret Posting"],
                      ["imgsekritPosting", "Image Secret Posting<br><br>(Check off the following option if you have drag and drop problems)"],
                      ["enablemegucaplayer","Enable music player"],
                      ["megucaplayerOption", "Show music player<br>"],
                      ["annoyingFormatting", "Annoying formatting button"],
                      ["mathOption", "Enables math parsing"],
                      ["chuuOption", "Enables receivement of chuu~s"],
                      ["cancelposters", "Dumb cancelposters"],
                      ["showDeletedPosts", "Show deleted posts"],
                      ["showWhoDeletedPosts", "Show who deleted/banned posts"],
                      ["filterPosts", "Filter posts"],
                      ["preSubmitOption", "Enables pre-submit post processing (necessary for some functions)"],
                      ["skeletonCount", "Shows humans / skeletons instead of humans / total"],
                      ["skeletonLabels", "Show human / skeleton labels on the numbers when the above option is enabled"]];

// The current settings (will be loaded before other methods are called)
var currentlyEnabledOptions = new Set();
// Add custom options here if needed
var flashingDuration = 60;
var vibrationDuration = 20;
var customFilterText = "#Custom filters (lines starting with # are ignored)\n\
#text: is assumed by default if you don't specify otherwise\n\
#text:^[Aa]+$\n\
#name:[^(^Anonymous$)]\n\
#id:Fautatkal\n\
#flag:Sweden\n\
#filename:image\\.png\n";
var customFilters = [];
const filterTypes = new Map([["text", ".post-container"],
                             ["name", ".name.spaced > span:nth-child(1)"],
                             ["id", ".name.spaced > span:nth-child(2)"],
                             ["flag", ".flag"],
                             ["filename", "figcaption > a:not(.image-toggle)"]]);

function hackLatsOptions() {
    var options = document.getElementById("options");
    var tab_butts = options.getElementsByClassName("tab-butts")[0];
    var tab_cont = options.getElementsByClassName("tab-cont")[0];

    // add checkboxes for each option
    var new_butt /*lewd*/ = "<a class=\"tab-link\" data-id=\"5\">Meguca Userscript</a>";
    var new_cont = "<div data-id=\"5\">";
    for (var i = 0; i < onOffOptions.length; i++) {
        var id = onOffOptions[i][0];
        var name = onOffOptions[i][1];
        new_cont += "<input type=\"checkbox\" name=" + id + " id=" + id + "> <label for=" + id + ">" + name + "</label><br>";
    }

    // flashing duration
    new_cont += "<input type=\"textbox\" name=flashing id=flashing> <label for=flashing>Flashing Duration</label><br>";

    // vibration duration
    new_cont += "<input type=\"textbox\" name=vibration id=vibration> <label for=vibration>Vibration Duration</label><br>";

    // image stealing
    new_cont += "<span>Steal all files ending with </span><input type=\"textbox\" name=steal_filetypes id=steal_filetypes><button type=\"button\" id=\"stealButton\">Steal files</button><br>";

    // custom filters
    new_cont += "<textarea rows=4 cols=60 id=customFilters style='font-size: 10pt;'></textarea><br>";
    new_cont += "<button type=\"button\" id=\"saveFilters\">Save filter changes</button><br>";

    // Chuu counter
    new_cont += "<br>You have received <span id=\"chuu-counter\">" + chuuCount + "</span> chuu~'s";

    // Linking to github
    new_cont += "<br><a href=\"https://github.com/dasdgdafg/megukascript/blob/master/README.md\" target=\"_blank\">How do I use this?</a>";

    var new_sekrit_cont = "<div data-id=\"6\">";

    // hidetext encode
    new_sekrit_cont += "<input type=\"textbox\" name=hidetext id=hidetext> <label for=hidetext>Encode Text</label> <button type=\"button\" id=\"secretButton\">Convert & input</button><br>";

    // image for secret message
    new_sekrit_cont += "<input name=\"secret_image\" id=\"secret_image\" type=\"file\">";

    // Another link to github
    new_sekrit_cont += "<br><a href=\"https://github.com/dasdgdafg/megukascript/blob/master/README.md\" target=\"_blank\">How do I use this?</a>";

    // Secret Encoding tab
    var new_sekrit_butt = "<a class=\"tab-link\" data-id=\"6\">Secret Encoding</a>";

    new_cont += "</div>";
    new_sekrit_cont += "</div>";
    tab_butts.innerHTML += new_butt + new_sekrit_butt;
    tab_cont.innerHTML += new_cont + new_sekrit_cont;

    for (var i = 0; i < onOffOptions.length; i++) {
        var id = onOffOptions[i][0];
        // set the correct intial state
        document.getElementById(id).checked = currentlyEnabledOptions.has(id);

        // set all the handler functions
        document.getElementById(id).onchange = function() {
            localStorage.setItem(this.id, this.checked ? "on" : "off");
        };
    }

    document.getElementById("megucaplayerOption").onclick = mgcPl_optionClicked;

    // flashing duration
    document.getElementById("flashing").value = flashingDuration;
    document.getElementById("flashing").onchange = function(){
        var num = Number(this.value);
        if (Number.isNaN(num)) num = 60;
        localStorage.setItem(this.id, (this.value > 60) ? 60 : this.value);
    };

    // vibration duration
    document.getElementById("vibration").value = vibrationDuration;
    document.getElementById("vibration").onchange = function(){
        var num = Number(this.value);
        if (Number.isNaN(num)) num = 60;
        localStorage.setItem(this.id, (this.value > 60) ? 60 : this.value);
    };

    document.querySelector("#hidetext").addEventListener("keyup", function(event) {
        if(event.key !== "Enter") return; // Use `.key` instead.
        document.querySelector("#secretButton").click(); // Things you want to do.
        event.preventDefault(); // No need to `return false;`.
    });

    document.getElementById("steal_filetypes").value = defaultFiletypes;
    document.getElementById("stealButton").onclick = function() {
        downloadAll();
    };

    document.getElementById("secretButton").onclick = secretButtonPressed;

    document.getElementById("hidetext").addEventListener('paste', function(e){
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

    document.getElementById("customFilters").value = customFilterText;
    document.getElementById("saveFilters").onclick = function() {
        customFilterText = document.getElementById("customFilters").value;
        localStorage.setItem("customFilterText", document.getElementById("customFilters").value);
    };
}

function insertCuteIntoCSS() {
    var css = document.createElement("style");
    css.type = "text/css";
    // calculate lengths
    css.innerHTML = ".sekrit_text { color: #FFDC91; }" +
        ".lewd_color { animation: lewd_blinker 0.7s linear " + getIterations(0.7) + "; color: pink; } @keyframes lewd_blinker { 50% { color: #FFD6E1 } }" +
        ".decision_roll { animation: decision_blinker 0.4s linear 2; color: lightgreen; } @keyframes decision_blinker { 50% { color: green } }" +
        ".planeptune_wins { animation: planeptune_blinker 0.6s linear " + getIterations(0.6) + "; color: mediumpurple; } @keyframes planeptune_blinker { 50% { color: #fff} }"+
        ".lastation_wins { animation: lastation_blinker 0.6s linear " + getIterations(0.6) + "; color: #000; } @keyframes lastation_blinker { 50% { color: #fff} }"+
        ".lowee_wins { animation: lowee_blinker 0.6s linear " + getIterations(0.6) + "; color: #e6e6ff; } @keyframes lowee_blinker { 50% { color: #c59681 }}"+
        ".leanbox_wins { animation: leanbox_blinker 0.6s linear " + getIterations(0.6) + "; color: #4dff4d; } @keyframes leanbox_blinker { 50% { color: #fff} }"+
        ".thousand_pyu { animation: pyu_blinker 0.4s linear " + getIterations(0.4) + "; color: aqua; } @keyframes pyu_blinker { 50% { color: white } }"+
        ".filtered :not(.filter-stub) { display: none }" +
        ".shaking_post { animation: screaming 0.5s linear 0s " + getVibrationIterations() + "; } @keyframes screaming { 0% { -webkit-transform: translate(2px, 1px) rotate(0deg); } 10% { -webkit-transform: translate(-1px, -2px) rotate(-1deg); } 20% { -webkit-transform: translate(-3px, 0px) rotate(1deg); } 30% { -webkit-transform: translate(0px, 2px) rotate(0deg); } 40% { -webkit-transform: translate(1px, -1px) rotate(1deg); } 50% { -webkit-transform: translate(-1px, 2px) rotate(-1deg); } 60% { -webkit-transform: translate(-3px, 1px) rotate(0deg); } 70% { -webkit-transform: translate(2px, 1px) rotate(-1deg); } 80% { -webkit-transform: translate(-1px, -1px) rotate(1deg); } 90% { -webkit-transform: translate(2px, 2px) rotate(0deg); } 100% { -webkit-transform: translate(1px, -2px) rotate(-1deg); } }";
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
    for (var i = 0; i < onOffOptions.length; i++) {
        var id = onOffOptions[i][0];
        var setting = localStorage.getItem(id);
        if (setting != "off") {
            currentlyEnabledOptions.add(id);
        }
    }
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
        } catch(e) {
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
        var secret = findMultipleShitFromAString(post.innerHTML, /<code class=\"code-tag\"><\/code><del>([^#<>\[\]]*)<\/del><code class=\"code-tag\"><\/code>/g);
        for (var j = secret.length - 1; j >= 0; j--) {
            parseSecretPost(post, secret[j]);
        }
        var secretQuote = findMultipleShitFromAString(post.innerHTML, /[ >]󠁂&gt;󠁂&gt;([\d]+)(?:[ <]+)/g);
        for (var j = secretQuote.length - 1; j >= 0; j--) {
            parseSecretQuote(post, secretQuote[j]);
        }
    }
    if (currentlyEnabledOptions.has("sharesOption")) {
        var shares = findMultipleShitFromAString(post.innerHTML, /\[([^\]\[]*)\] <strong( class=\"\w+\")?>#(\d+)d(\d+) \(([\d +]* )*= (?:\d+)\)<\/strong>/g);
        for (var j = shares.length - 1; j >= Math.max(0,shares.length-4); j--) {
            parseShares(post, shares[j]);
        }
    }
    if (currentlyEnabledOptions.has("pyuOption")) {
        var pyu = findMultipleShitFromAString(post.innerHTML, /<strong>#pyu \(([\d+]*)\)<\/strong>/g);
        for (var j = pyu.length - 1; j >= 0; j--) {
            parsePyu(post, pyu[j]);
        }
    }
    if (currentlyEnabledOptions.has("mathOption")) {
        var math = findMultipleShitFromAString(post.innerHTML, /#math\(((?:[\d-+/*%().^ ]*(?:log)*)*)\)/g);
        for (var j = math.length - 1; j >= 0; j--) {
            parseMath(post, math[j]);
        }
    }
    if (currentlyEnabledOptions.has("chuuOption")) {
        var chuu = findMultipleShitFromAString(post.innerHTML, /#chuu\( ?(\d*) ?\)/g);
        for (var j = chuu.length - 1; j >= 0; j--) {
            parseChuu(post, chuu[j]);
        }
    }
    if (currentlyEnabledOptions.has("decideOption")) {
        var decide;
        decide = findMultipleShitFromAString(post.innerHTML, /\[([^#\]\[]*)\]\s<strong( class=\"\w+\")?>#d([0-9]+) \(([0-9]+)\)<\/strong>/g);
        for (var j = decide.length - 1; j >= 0; j--) {
            parseDecide(post, decide[j], false);
        }

        decide = findMultipleShitFromAString(post.innerHTML, /(?:<blockquote>|<br>)([^><]*)(\s|<br>)<strong( class=\"\w+\")?>#d([0-9]+) \(([0-9]+)\)<\/strong>/g);
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
    var posts = document.getElementsByClassName('post-container');
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
        var pyuHTML = "<strong class=\"thousand_pyu\"> 💦 " + pyu[0].substring(8) + " 💦 ";
        post.innerHTML = before + pyuHTML + after;
    }
}

function parseMath(post, math) {
    var expr = math[1];
    expr = parseMath_addPow(expr).replace(/log/g, 'Math.log');
    var result;
    try {
        result = eval(expr);
    } catch (err) {
        result = '???';
    }
    if (isNaN(result)) result = '???';

    var before = post.innerHTML.substring(0, math.index);
    var after = post.innerHTML.substring(math.index + math[0].length);
    var mathHTML = "<strong>" + math[0].substring(0, 5) + " " + math[0].substring(5, math[0].length - 1) + " = " + result + ")</strong>";
    post.innerHTML = before + mathHTML + after;
}

function parseMath_addPow(str) {
    for (let i = str.length-1; i >= 0; i--) {
        if (str[i] !== "^") continue;
        let parentheses = 0;
        const operators = /[-+*/%^]/;

        // looking ahead
        let j;
        for (j = i+1; j < str.length; j++) {
            if (str[j] === "(") parentheses++;
            else if (str[j] === ")" && parentheses > 0) parentheses--;
            else if (operators.test(str[j]) && parentheses === 0) break;
        }
        // j is just after the term

        // looking back
        let k;
        parentheses = 0; // so it doesn't break even more stuff;
        for (k = i-1; k >= 0; k--) {
            if (str[k] === ")") parentheses++;
            else if (str[k] === "(" && parentheses > 0) parentheses--;
            else if (operators.test(str[k]) && parentheses === 0) break;
        }
        // k is just before the term
        k++; // k is on the beginning of the term

        str = str.substring(0, k) + "Math.pow(" + str.substring(k,i) + "," +
              str.substring(i+1, j) + ")" + str.substring(j);
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
        var ownName = post.parentNode.querySelector("header").getElementsByTagName("B")[0];
        // Don't chuu yourself
        if (ownName.getElementsByTagName("I").length > 0) return;

        chuuHTML += " class=\"lewd_color\"";
        chuuCount = localStorage.getItem("chuuCount", chuuCount);
        chuuCount++;
        localStorage.setItem("chuuCount", chuuCount);
        document.getElementById("chuu-counter").innerHTML = chuuCount;

        var message = "chuu~";
        if (chuuCount % 10 === 0) {
            message += "\nCongratulations on your pregnancy!\nYou now have " +
                chuuCount / 10 +
                " children!";
        }

        alert(message);
    }

    chuuHTML += ">#chuu~(" + chuu[1] + ")</strong>";
    post.innerHTML = before + chuuHTML + after;
}

function parseDecide(post, decide, isSmart) {
    var offset = (isSmart) ? 1 : 0;

    var options = decide[1].split(",");
    var n = decide[3 + offset];
    var m = decide[4 + offset];

    var before = post.innerHTML.substring(0, decide.index);
    var after = post.innerHTML.substring(decide.index + decide[0].length);

    if (options.length != n || n == 1) return;
    options[m-1] = "<strong class=\"decision_roll\">" + options[m-1] + "</strong>";
    var newInner = options.toString();
    var retreivedRoll;
    if (decide[2 + offset] == null) {
        retreivedRoll = " <strong>#d" + n + " (" + m + ")</strong>";
    } else {
        retreivedRoll = " <strong" + decide[2 + offset] + ">#d" + n + " (" + m + ")</strong>";
    }

    if (isSmart) {
        if (decide[0].substring(0,3) === "<br") before += "<br>";
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
            if(options[j].match(/(^|\W)planeptune($|\W)(?!\w)/i)){
                options[j] = "</strong><strong class=\"planeptune_wins\">" + options[j] + formattedRoll + "</strong><strong>";
            }else if(options[j].match(/(^|\W)lastation($|\W)(?!\w)/i)){
                options[j] = "</strong><strong class=\"lastation_wins\">" + options[j] + formattedRoll + "</strong><strong>";
            }else if(options[j].match(/(^|\W)lowee($|\W)(?!\w)/i)){
                options[j] = "</strong><strong class=\"lowee_wins\">" + options[j] + formattedRoll + "</strong><strong>";
            }else if(options[j].match(/(^|\W)leanbox($|\W)(?!\w)/i)){
                options[j] = "</strong><strong class=\"leanbox_wins\">" + options[j] + formattedRoll + "</strong><strong>";
            }else{
                options[j] = "</strong><strong class=\"decision_roll\">" + options[j] + formattedRoll + "</strong><strong>";
            }

        } else {
            options[j] = options[j] + formattedRoll;
        }
    }

    var newInner = options.join("<br>");
    if (before.substring(before.length-4) != "<br>" && before.substring(before.length-4) != "ote>") {
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
    var config = { attributes: true, childList: true, subtree: true, attributeOldValue: true };

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length == 0) {
                if (mutation.type == "attributes" && mutation.attributeName == "class") {
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
                            if (post.classList.contains("hidden") && postContent.innerText == "") {
                                // look for events that removed nodes
                                var cancelled = false;
                                for (var j = 0; j < mutations.length; j++) {
                                    var removeEvt = mutations[j];
                                    if (removeEvt.type == "childList") {
                                        for (var i = 0; i < removeEvt.removedNodes.length; i++) {
                                            var node = removeEvt.removedNodes[i];
                                            // don't re-add the 'Hide, Report' menu if it disappeared
                                            // or the post controls or editable textarea
                                            if (!((node.classList && node.classList.contains("popup-menu")) ||
                                                 node.id == "post-controls" ||
                                                 node.id == "text-input")) {
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
                                    post.addEventListener("mousemove", function(e){e.stopPropagation();});
                                }
                            }
                        }
                        // check for posts finishing
                        // (the current user deadposting will have been 'reply-form' but not 'editing')
                        if ((mutation.oldValue.split(" ").includes("editing") ||
                             mutation.oldValue.split(" ").includes("reply-form")) &&
                             !post.classList.contains("editing") &&
                             !post.classList.contains("reply-form")) {
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
                    if (mutation.target.parentNode &&
                        mutation.target.parentNode.parentNode &&
                        mutation.target.parentNode.parentNode.nodeName == "ARTICLE") {
                        postItself = mutation.target.parentNode.parentNode;
                    }
                } else if (mutation.addedNodes[0].nodeName == "ARTICLE") {
                    postItself = mutation.addedNodes[0];
                } else if (mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.contains("admin","banned")) {
                    if (currentlyEnabledOptions.has("showWhoDeletedPosts")) {
                        checkForDeletedOrBannedPost(mutation.target);
                    }
                }

                if (postItself == undefined) {
                    return;
                }
                var postContent = postItself.getElementsByClassName("post-container")[0];
                if (postContent == undefined) {
                    return;
                }

                // still editing
                if (postItself.getAttribute("class").includes("editing") || postItself.getAttribute("class").includes("reply-form")) {
                    // add Format button to posts the user is making
                    if (postItself.getAttribute("class").includes("reply-form")) {
                        if (currentlyEnabledOptions.has("annoyingFormatting")) addFormatButton(postItself);
                        if (currentlyEnabledOptions.has("preSubmitOption")) overrideDoneButton(postItself);
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
    input.value = input.value.split(" ").map(formatWord).join(" ");
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent('input', false, true);
    input.dispatchEvent(evt);
}

function formatWord(s) {
    // pick a random format and add it to both sides of the word
    var format = ["~~","**","@@","``"][Math.floor(Math.random()*4)];
    return format + s + format;
}

function setUpEdenBanner() {
    var banner = document.getElementById("banner-center");
    banner.innerHTML = "<a href=\"http://edenofthewest.com/\" target=\"_blank\">[synced] DJ</a>&nbsp;&nbsp;<a title=\"Click to google song\" href=\"https://www.google.com.br/search?q=gomin\" target=\"_blank\"><b>Song</b></a></b>";
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
    songInfo.href = "https://www.google.com.br/search?q=" + encodeURIComponent(edenJSON.current);
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
    if ((text == "" || text == " ") && post.getElementsByTagName("figure").length == 0) {
        var quality = (currentlyEnabledOptions.has("dumbblanc")) ? "dumb" : "cute";
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
        addToName(post, " (Dumb haiku poster / 'wait anon' is all she says / Don't wait, run away!)");
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
    text = text.replace(/(?:>>\d* (?:\(You\) )?#)/g, "").replace(/(?:>>\d*)/g, "").replace(/[\s\W\d_]/g, "");

    var isBlanc = (text.length == 0);
    var hasLower = text.match("[a-z]");
    var isShort = (text.length <= 5);
    if (!isShort && !isBlanc && !hasLower && !wholePost.className.match("shaking_post")) {
        wholePost.className += " shaking_post";
    }
}

function addToName(post, message) {
    var name = post.parentNode.getElementsByClassName("name spaced")[0];
    var newText = document.createTextNode(message);
    newText.id = "dumbposter";
    // remove existing names
    name.parentNode.childNodes.forEach((node) => {
        if (node.id == "dumbposter") {
            name.parentNode.removeChild(node);
        }
    });
    name.parentNode.insertBefore(newText, name.nextSibling);
}

function filterPost(postContent) {
    var post = postContent.parentNode;
    if (post.classList.contains("filtered") ||
        post.classList.contains("filtered-shown")) {
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
    if (document.getElementById("thread-container") != null)
        setObservers();
    hackLatsOptions();
    if (currentlyEnabledOptions.has("enablemegucaplayer")) mgcPl_setupPlaylist();
    if (currentlyEnabledOptions.has("edenOption")) setUpEdenBanner();
    if (currentlyEnabledOptions.has("showDeletedPosts")) watchSocketForPostsDeletedOnCreation();
}

function downloadAll() {
    var posts = document.getElementById("thread-container").children;
    var filetypes = document.getElementById("steal_filetypes").value.split(" ");
    for (var i = 0; i < posts.length; i++) {
        if (posts[i].tagName.toLowerCase() === "article" &&
            posts[i].querySelector("figcaption") != null) {
            var anchor = posts[i].querySelector("figcaption").children[3];
            for (var j = 0; j < filetypes.length; j++)
                if (anchor.href.endsWith(filetypes[j]))
                    anchor.click();
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
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent('input', false, true);
    input.dispatchEvent(evt);
    document.getElementById("post-controls").children[0].click();
}

// All functions here must edit "input.value". This is the post written content.
function handlePreSubmit(input) {
    // Put memes here
}

setup();
