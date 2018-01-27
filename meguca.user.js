// ==UserScript==
// @name        megucascript
// @namespace   megucasoft
// @description Does a lot of stuff
// @include     https://meguca.org/*
// @version     1.6
// @author      medukasthegucas
// @grant       none
// ==/UserScript==

// Things the user can turn on or off, add your new feature to this list
// For more complicated options, add them to the hackLatsOptions and getCurrentOptions functions
const onOffOptions = [["diceOption", "Dice coloring"],
                      ["edenOption", "Eden Now Playing Banner"],
                      ["pyuOption", "Pyu Coloring~"],
                      ["rouletteOption", "Roulette"],
                      ["decideOption", "Decision Coloring"],
                      ["dumbPosters", "Dumb xposters"],
                      ["dumbblanc", "dumb blancposters, not cute"],
                      ["sharesOption", "Shares Formatting"],
                      ["screamingPosters", "Vibrate screaming posts"],
                      ["sekritPosting", "Secret Posting"]];
// The current settings (will be loaded before other methods are called)
var currentlyEnabledOptions = new Set();
// Add custom options here if needed
var flashingDuration = "infinite";
var vibrationDuration = 20;

// For most new features, you'll want to put a call to your function in this function
// This will be called multiple times per post, so handlers should be idempotent
function handlePost(post) {
    if (currentlyEnabledOptions.has("sharesOption")) {
        var shares = findMultipleShitFromAString(post.innerHTML, /\[([^#\]\[‮]*)\] <strong( class=\"\w+\")?>#(\d+)d(\d+) \(([\d +]* )*= (?:\d+)\)<\/strong>/g);
        for (var j = shares.length - 1; j >= 0; j--) {
            parseShares(post, shares[j]);
        }
    }
    if (currentlyEnabledOptions.has("diceOption")) {
        var dice = findMultipleShitFromAString(post.innerHTML, /<strong>#(\d*)d(\d+) \((?:[\d +]* )*=? ?(\d+)\)<\/strong>/g);
        for (var j = dice.length - 1; j >= 0; j--) {
            parseRoll(post, dice[j]);
        }
    }
    if (currentlyEnabledOptions.has("pyuOption")) {
        var pyu = findMultipleShitFromAString(post.innerHTML, /<strong>#pyu \(([\d+]*)\)<\/strong>/g);
        for (var j = pyu.length - 1; j >= 0; j--) {
            parsePyu(post, pyu[j]);
        }
    }
    if (currentlyEnabledOptions.has("rouletteOption")) {
        var rouletteDice = findMultipleShitFromAString(post.innerHTML, /#roulette <strong>#d[1-6] \((?:[\d +]* )*=? ?(\d+)\)<\/strong>/g);
        for (var j = rouletteDice.length - 1; j >= 0; j--) {
            parseRoulette(post, rouletteDice[j]);
        }
    }
    if (currentlyEnabledOptions.has("decideOption")) {
        var decide = findMultipleShitFromAString(post.innerHTML, /\[([^#\]\[‮]*)\] <strong( class=\"\w+\")?>#d([0-9]+) \(([0-9]+)\)<\/strong>/g);
        for (var j = decide.length - 1; j >= 0; j--) {
            parseDecide(post, decide[j]);
        }
    }
    if (currentlyEnabledOptions.has("sekritPosting")) {
        var secret = findMultipleShitFromAString(post.innerHTML, /<code class=\"code-tag\"><\/code><del>([^#<>\[\]]*)<\/del><code class=\"code-tag\"><\/code>/g);
        for (var j = secret.length - 1; j >= 0; j--) {
            parseSecretPost(post, secret[j]);
        }
    }
    if (currentlyEnabledOptions.has("dumbPosters")) {
        checkForDumbPost(post);
    }
    if (currentlyEnabledOptions.has("screamingPosters")) {
        checkForScreamingPost(post);
    }
}

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

    // hidetext encode
    new_cont += "<input type=\"textbox\" name=hidetext id=hidetext> <label for=hidetext>Encode Text</label> <button type=\"button\" id=\"secretButton\">Convert & input</button><br>";

    // Linking to github
    new_cont += "<br><a href=\"https://github.com/GoatSalad/megukascript/blob/master/README.md\" target=\"_blank\">How do I use this?</a>";

    tab_butts.innerHTML += new_butt;
    tab_cont.innerHTML += new_cont;

    for (var i = 0; i < onOffOptions.length; i++) {
        var id = onOffOptions[i][0];
        // set the correct intial state
        document.getElementById(id).checked = currentlyEnabledOptions.has(id);

        // set all the handler functions
        document.getElementById(id).onchange = function() {
            localStorage.setItem(this.id, this.checked ? "on" : "off");
        };
    }

    // flashing duration
    document.getElementById("flashing").value = flashingDuration;
    document.getElementById("flashing").onchange = function(){
        localStorage.setItem(this.id, this.value);
    };

    // vibration duration
    document.getElementById("vibration").value = vibrationDuration;
    document.getElementById("vibration").onchange = function(){
        localStorage.setItem(this.id, this.value);
    };
    
    document.getElementById("secretButton").onclick = function(){
        if (document.getElementById('text-input')!=null) {
            var text = btoa(unescape(encodeURIComponent(document.getElementById('hidetext').value)));
            document.getElementById('hidetext').value='';
            document.getElementById('text-input').value = document.getElementById('text-input').value.substring(0,document.getElementById('text-input').selectionStart) + '````**' + text + '**````' + document.getElementById('text-input').value.substring(document.getElementById('text-input').selectionEnd);
            var evt = document.createEvent('HTMLEvents');evt.initEvent('input', false, true);document.getElementById('text-input').dispatchEvent(evt);
        }
    };
}

function insertCuteIntoCSS() {
    var css = document.createElement("style");
    css.type = "text/css";
    // calculate lengths
    css.innerHTML = ".super_roll { animation: pink_blinker 0.4s linear " + getIterations(0.4) + "; color: pink; } @keyframes pink_blinker { 50% { color: deeppink } }" +
        ".lewd_roll { animation: lewd_blinker 0.7s linear " + getIterations(0.7) + "; color: pink; } @keyframes lewd_blinker { 50% { color: #FFD6E1 } }" +
        ".kuso_roll { animation: brown_blinker 1s linear " + getIterations(1) + "; color: #825025; } @keyframes brown_blinker { 50% { opacity: 0.7 } }" +
        ".dubs_roll { animation: blue_blinker 0.4s linear " + getIterations(0.4) + "; color: aqua; } @keyframes blue_blinker { 50% { color: blue } }" +
        ".trips_roll { animation: yellow_blinker 0.4s linear " + getIterations(0.4) + "; color: yellow; } @keyframes yellow_blinker { 50% { color: darkorange } }" +
        ".quads_roll { animation: green_blinker 0.4s linear " + getIterations(0.4) + "; color: lime; } @keyframes green_blinker { 50% { color: darkgreen } }" +
        ".rainbow_roll { animation: rainbow_blinker 2s linear " + getIterations(2) + "; color: red; } @keyframes rainbow_blinker { 14% {color: orange} 28% {color: yellow} 42% {color: green} 57% {color: blue} 71% {color: indigo} 85% {color: violet} }" +
        ".dangerous_roll {font-size: 110%; color: #f00000; }" +
        ".dead_fuck { color: #e55e5e; }" +
        ".sekrit_text { color: #FFDC91; }" +
        ".decision_roll { animation: decision_blinker 0.4s linear 2; color: lightgreen; } @keyframes decision_blinker { 50% { color: green } }" +
        ".planeptune_wins { animation: planeptune_blinker 0.6s linear " + getIterations(0.6) + "; color: mediumpurple; } @keyframes planeptune_blinker { 50% { color: #fff} }"+
        ".lastation_wins { animation: lastation_blinker 0.6s linear " + getIterations(0.6) + "; color: #000; } @keyframes lastation_blinker { 50% { color: #fff} }"+
        ".lowee_wins { animation: lowee_blinker 0.6s linear " + getIterations(0.6) + "; color: #e6e6ff; } @keyframes lowee_blinker { 50% { color: #c59681 }}"+
        ".leanbox_wins { animation: leanbox_blinker 0.6s linear " + getIterations(0.6) + "; color: #4dff4d; } @keyframes leanbox_blinker { 50% { color: #fff} }"+
        ".thousand_pyu { animation: pyu_blinker 0.4s linear " + getIterations(0.4) + "; color: aqua; } @keyframes pyu_blinker { 50% { color: white } }"+
        ".shaking_post { animation: screaming 0.5s linear 0s " + getVibrationIterations() + "; } @keyframes screaming { 0% { -webkit-transform: translate(2px, 1px) rotate(0deg); } 10% { -webkit-transform: translate(-1px, -2px) rotate(-1deg); } 20% { -webkit-transform: translate(-3px, 0px) rotate(1deg); } 30% { -webkit-transform: translate(0px, 2px) rotate(0deg); } 40% { -webkit-transform: translate(1px, -1px) rotate(1deg); } 50% { -webkit-transform: translate(-1px, 2px) rotate(-1deg); } 60% { -webkit-transform: translate(-3px, 1px) rotate(0deg); } 70% { -webkit-transform: translate(2px, 1px) rotate(-1deg); } 80% { -webkit-transform: translate(-1px, -1px) rotate(1deg); } 90% { -webkit-transform: translate(2px, 2px) rotate(0deg); } 100% { -webkit-transform: translate(1px, -2px) rotate(-1deg); } }";
    document.head.appendChild(css);
}

function getIterations(period) {
    if (flashingDuration == "infinite") {
        return "infinite";
    }
    return flashingDuration / period;
}

function getVibrationIterations() {
    if (vibrationDuration == "infinite") {
        return "infinite";
    }
    return vibrationDuration / 0.5;
}

function readPostsForRolls() {
    var posts = document.getElementsByClassName('post-container');
    for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        handlePost(post);
    }
}

function parseRoll(post, die) {
    var n = die[1];
    var m = die[2];
    var x = die[3];

    var before = post.innerHTML.substring(0, die.index);
    var after = post.innerHTML.substring(die.index + die[0].length);

    var rollHTML = getRollHTML(n, m, x);
    if (rollHTML != "") {
        post.innerHTML = before + rollHTML + die[0].substring(8) + after;
    }
}

function getRollHTML(numberOfDice, facesPerDie, result) {
    var divided = (""+result).split(""); //Splits the number into single digits to check for dubs, trips, etc
    if (numberOfDice == "") {
        numberOfDice = 1;
    }
    var maxRoll = numberOfDice * facesPerDie; // because javascript just lets you multiply strings together...
    // do nothing for totals below 10, or for n d1s
    if (maxRoll < 10 || facesPerDie == 1) {
        return "";
    }

    if (numberOfDice == 1 && facesPerDie == result && result == 7777) { // Marrying navy-tan!
        return "<strong class=\"rainbow_roll\">Congrats! You get to marry navy-tan! ";
    } else if (maxRoll == result) {
        return "<strong class=\"super_roll\">";
    } else if (result == 1) {
        return "<strong class=\"kuso_roll\">";
    } else if (result == 69 || result == 6969) {
        return "<strong class=\"lewd_roll\">";
    } else if (checkEm(divided)) {
        switch (divided.length) {
            case 2:
                return "<strong class=\"dubs_roll\">";
            case 3:
                return "<strong class=\"trips_roll\">";
            case 4:
                return "<strong class=\"quads_roll\">";
            default: // QUINTS!!!
                return "<strong class=\"rainbow_roll\">";
        }
    }
    return "";
}

function parseRoulette(post, die) {
    var postEnding = post.innerHTML.substring(post.innerHTML.length-2);
    var before = post.innerHTML.substring(0, die.index);
    var n =String(die).substring(20,21);
    var after = "("+die[1]+"/"+n+")"+post.innerHTML.substring(die.index +25);


    if (die[1] == 1)
        post.innerHTML = before + "<strong class=\"dead_fuck\"> #roulette " + after;
    else
        post.innerHTML = before + "<strong> #roulette " + after;

    // if post ends in "g>" then the strong tag is already set
    if(die[1] == 1 && postEnding != "g>")
        post.innerHTML += "\n <strong class=\"dangerous_roll\"> USER WAS KILLED FOR THIS ROLL</strong>";
}


function parsePyu(post, pyu) {
    var n = pyu[1];
    var nsub;
    var before = post.innerHTML.substring(0, pyu.index);
    var after = post.innerHTML.substring(pyu.index + pyu[0].length);

    if (n % 1000 == 0) {
        var pyuHTML = "<strong class=\"thousand_pyu\"> 💦 " + pyu[0].substring(8) + " 💦 ";
        post.innerHTML = before + pyuHTML + after;
    }
}

function parseDecide(post, decide) {
    var options = decide[1].split(",");
    var n = decide[3];
    var m = decide[4];

    var before = post.innerHTML.substring(0, decide.index);
    var after = post.innerHTML.substring(decide.index + decide[0].length);

    if (options.length != n || n == 1) return;
    options[m-1] = "<strong class=\"decision_roll\">" + options[m-1] + "</strong>";
    var newInner = options.toString();
    var retreivedRoll;
    if (decide[2] == null) {
        retreivedRoll = " <strong>#d" + n + " (" + m + ")</strong>";
    } else {
        retreivedRoll = " <strong" + decide[2] + ">#d" + n + " (" + m + ")</strong>";
    }
    post.innerHTML = before + newInner + retreivedRoll + after;
}

function parseSecretPost(post, secret) {
    var text = secret[1];
    var before = post.innerHTML.substring(0, secret.index);
    var after = post.innerHTML.substring(secret.index + secret[0].length);

    var decodedMessage = "";
    try {
        decodedMessage = decodeURIComponent(escape(atob(text)));
    } catch (e) {
        console.log("invalid secret message: " + text)
        return;
    }
    decodedMessage = decodedMessage.replace(new RegExp("<", 'g'), "<󠁂");
    decodedMessage = decodedMessage.replace(new RegExp(">", 'g'), "󠁂>");
    post.innerHTML = before + "<strong class=\"sekrit_text\">" + decodedMessage + "</strong>" + after;
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
        var rollHTML = getRollHTML(1, maxShares, shareValues[j]);
        var formattedRoll = " (" + shareValues[j] + "/" + maxShares + ")";
        // format the dice if needed
        if (rollHTML != "") {
            if (shareValues[j] == highestValue) {
                // if the roll was formatted, the winning share format needs to be continued after the roll
                if(options[j].match(/(^|\W)planeptune($|\W)(?!\w)/i)){
                    formattedRoll = " (</strong>" + rollHTML + shareValues[j] + "/" + maxShares + "</strong><strong class=\"planeptune_wins\">)</strong><strong>";
                }else if(options[j].match(/(^|\W)lastation($|\W)(?!\w)/i)){
                    formattedRoll = " (</strong>" + rollHTML + shareValues[j] + "/" + maxShares + "</strong><strong class=\"lastation_wins\">)</strong><strong>";
                }else if(options[j].match(/(^|\W)lowee($|\W)(?!\w)/i)){
                    formattedRoll = " (</strong>" + rollHTML + shareValues[j] + "/" + maxShares + "</strong><strong class=\"lowee_wins\">)</strong><strong>";
                }else if(options[j].match(/(^|\W)leanbox($|\W)(?!\w)/i)){
                    formattedRoll = " (</strong>" + rollHTML + shareValues[j] + "/" + maxShares + "</strong><strong class=\"leanbox_wins\">)</strong><strong>";
                }else{
                    formattedRoll = " (</strong>" + rollHTML + shareValues[j] + "/" + maxShares + "</strong><strong class=\"decision_roll\">)</strong><strong>";
                }
            } else {
                formattedRoll = " (</strong>" + rollHTML + shareValues[j] + "/" + maxShares + "</strong><strong>)";
            }
        }

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

function checkEm(divided) {
    if (divided.length < 2) return false;

    var repeatingdigits=true;
    for (var u=divided.length-2; u>=0; u-=1) {
        if (divided[u]!=divided[divided.length-1]) {
            repeatingdigits=false;
            break;
        }
    }
    return repeatingdigits;
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

// First layer of observers watches the thread
// Second layers watches for when the post finishes
// Third layer for when the server updates the post

function setObservers() {
    var thread = document.getElementById("thread-container");

    // configuration of the observers:
    var config = { attributes: true, childList: true, characterData: true };
    var config2 = { attributes: true };

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length == 0) return;
            var postItself = mutation.addedNodes[0];
            var postContent = mutation.addedNodes[0].getElementsByClassName("post-container")[0];

            var observer2 = new MutationObserver(function(mutations2) {
                mutations2.forEach(function(mutation2) {
                    // Don't continue while still editing
                    if (postItself.getAttribute("class").includes("editing")) return;
                    // handlesPost (works for others posters)
                    handlePost(postContent);

                    // launch observer3 (only works for own posts)
                    var observer3 = new MutationObserver(function(mutations3) {
                        mutations3.forEach(function(mutation3) {
                            handlePost(postContent);
                        });
                    });

                    observer3.observe(postContent.children[0], config);

                    // kill both after 5 secs
                    setTimeout(function() { observer3.disconnect(); observer2.disconnect(); }, 5000);

                });
            });

            // pass in the target node, as well as the observer options
            observer2.observe(postItself, config2);
        });
    });

    // pass in the target node, as well as the observer options
    observer.observe(thread, config);
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
}

function setUpEdenBanner() {
    var banner = document.getElementById("banner-center");
    banner.innerHTML = "<a href=\"http://edenofthewest.com/\" target=\"_blank\">[synced] DJ</a>&nbsp;&nbsp;<a title=\"Click to google song\" href=\"https://www.google.com.br/search?q=gomin\" target=\"_blank\"><b>Song</b></a></b>";
    getInfoFromEden();
    window.setInterval(getInfoFromEden, 10000);
}

function getInfoFromEden() {
    xhttp = new XMLHttpRequest();
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
    // wait anon
    if (text.match(/^(?:>>\d* (?:\(You\) )?# )*wait anon$/i) != null) {
        addToName(post, " (Dumb haiku poster / 'wait anon' is all she says / Don't wait, run away!)");
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
    if (name.nextSibling.id == "dumbposter") {
        // already has a name, change it in case the content changed
        name.parentNode.removeChild(name.nextSibling);
    }
    name.parentNode.insertBefore(newText, name.nextSibling);
}

function setup() {
    getCurrentOptions();
    insertCuteIntoCSS();
    readPostsForRolls();
    setObservers();
    hackLatsOptions();
    if (currentlyEnabledOptions.has("edenOption")) setUpEdenBanner();
}

setup();
