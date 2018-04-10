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
                      ["imagePaste", "Upload pasted images"],
                      ["annoyingFormatting", "Annoying formatting button"],
                      ["mathOption", "Enables math parsing"],
                      ["chuuOption", "Enables receivement of chuu~s"],
                      ["cancelposters", "Dumb cancelposters"],
                      ["showDeletedPosts", "Show deleted posts"],
                      ["showWhoDeletedPosts", "Show who deleted posts"]];
                      
// The current settings (will be loaded before other methods are called)
var currentlyEnabledOptions = new Set();
// Add custom options here if needed
var flashingDuration = 60;
var vibrationDuration = 20;

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
}
