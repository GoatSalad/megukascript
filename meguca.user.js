// ==UserScript==
// @name        megucascript
// @namespace   megucasoft
// @description Does a lot of stuff
// @include     https://meguca.org/*
// @connect     meguca.org
// @version     2.4.6.2
// @author      medukasthegucas
// @grant       GM_xmlhttpRequest
// ==/UserScript==

//global scope
(function() {

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
                          ["megucaplayerOption", "Show music player"],
                          ["imagePaste", "Upload pasted images"],
                          ["annoyingFormatting", "Annoying formatting button"],
                          ["mathOption", "Enables math parsing"]];
    const nipponeseIndex = ["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
                            "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんゃゅょ心無日口二手山木糸羽雨辵水金色何"];
    // The current settings (will be loaded before other methods are called)
    var currentlyEnabledOptions = new Set();
    // Add custom options here if needed
    var flashingDuration = 60;
    var vibrationDuration = 20;
    const defaultFiletypes = ".jpg .png .gif";

    // For most new features, you'll want to put a call to your function in this function
    // This will be called multiple times per post, so handlers should be idempotent
    function handlePost(post) {
        if (currentlyEnabledOptions.has("sharesOption")) {
            var shares = findMultipleShitFromAString(post.innerHTML, /\[([^#\]\[]*)\] <strong( class=\"\w+\")?>#(\d+)d(\d+) \(([\d +]* )*= (?:\d+)\)<\/strong>/g);
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
            var math = findMultipleShitFromAString(post.innerHTML, /#math\(((?:[\d-+/*()., ]*(?:pow)*(?:log)*)*)\)/g);
            for (var j = math.length - 1; j >= 0; j--) {
                parseMath(post, math[j]);
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

        // image stealing
        new_cont += "<span>Steal all files ending with <span><input type=\"textbox\" name=steal_filetypes id=steal_filetypes><button type=\"button\" id=\"stealButton\">Steal files</button><br>";

        // Linking to github
        new_cont += "<br><a href=\"https://github.com/GoatSalad/megukascript/blob/master/README.md\" target=\"_blank\">How do I use this?</a>";

        var new_sekrit_cont = "<div data-id=\"6\">";

        // hidetext encode
        new_sekrit_cont += "<input type=\"textbox\" name=hidetext id=hidetext> <label for=hidetext>Encode Text</label> <button type=\"button\" id=\"secretButton\">Convert & input</button><br>";

        // image for secret message
        new_sekrit_cont += "<input name=\"secret_image\" id=\"secret_image\" type=\"file\">";

        // Another link to github
        new_sekrit_cont += "<br><a href=\"https://github.com/GoatSalad/megukascript/blob/master/README.md\" target=\"_blank\">How do I use this?</a>";

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

        document.getElementById("megucaplayerOption").onclick = function() {
            if (document.getElementById("megucaplayerOption").checked) {
                // Load songs and show
                mgcPl_songs = [];
                document.getElementById("megucaplaylist").innerHTML = "";
                mgcPl_fetchAllSongs();
                var frame = document.getElementById("mgcPlFrame");
                frame.style.display = "unset";
                frame.style.top = "100px";
                frame.style.left = "100px";
                mgcPl_seekerBar_updater = setInterval(mgcPl_updateSeekerBar, 1000);
            } else {
                mgcPl_stopPlayer();
                if (mgcPl_meguca_player !== null && mgcPl_meguca_player !== undefined) mgcPl_meguca_player.src = "";
                document.getElementById("mgcPlFrame").style.display = "none";
                clearInterval(mgcPl_seekerBar_updater);
            }
        };

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

        document.getElementById("secretButton").onclick = function() {
            var fileInput = document.getElementById("secret_image");
            if (document.getElementById('text-input')!=null) {
                if (fileInput.files.length == 0) {
                    // text only
                    var text = btoa(unescape(encodeURIComponent(document.getElementById('hidetext').value)));
                    document.getElementById('hidetext').value='';
                    for (var j = 0; j < nipponeseIndex[0].length; j++) {
                        if (text.indexOf(nipponeseIndex[0][j]) != -1) 
                            text = nipponeseIndex[0][j] == "/" || nipponeseIndex[0][j] == "+" ? text.replace(new RegExp("\\" + nipponeseIndex[0][j], 'g'), nipponeseIndex[1][j]) : text.replace(new RegExp(nipponeseIndex[0][j], 'g'), nipponeseIndex[1][j]);
                    }
                    document.getElementById('text-input').value = document.getElementById('text-input').value.substring(0,document.getElementById('text-input').selectionStart) + '````**' + text + '**````\n' + document.getElementById('text-input').value.substring(document.getElementById('text-input').selectionEnd);
                    var evt = document.createEvent('HTMLEvents');evt.initEvent('input', false, true);document.getElementById('text-input').dispatchEvent(evt);
                } else {
                    // encode text in an image
                    var te = new TextEncoder();
                    var hiddenText = document.getElementById('hidetext').value;
                    if (te.encode(hiddenText).length > 999) {
                        alert("secret text too long ;_;");
                        return;
                    }
                    var len = te.encode(hiddenText).length.toString();
                    if (len.length < 3)
                        len = "0" + len;
                    if (len.length < 3)
                        len = "0" + len;

                    hiddenText += len;
                    hiddenText += "secret";
                    var file = fileInput.files[0];
                    var fr = new FileReader();
                    fr.onload = function() {
                        var buffer = this.result;
                        var newfile = new File([buffer, te.encode(hiddenText)], file.name);
                        var possibleInputs = document.getElementsByName("image");
                        var realInput;
                        for (var i = 0; i < possibleInputs.length; i++) {
                            if (possibleInputs[i].offsetParent != null) {
                                realInput = possibleInputs[i];
                                break;
                            }
                        }
                        // weird hacks to set our modified file
                        // You can't set the files in a file input in javascript
                        // But meguca's code has a reference to the file input
                        // So fuck up the input object, then the browser will let us set `files` on it
                        // And put back some functions which other parts of meguca's code needs
                        var obj = new Object;
                        var oldFns = realInput.__proto__;
                        realInput.__proto__ = obj.__proto__;
                        realInput.files = [newfile];
                        realInput.style = { display : "block" };
                        realInput.remove = oldFns.remove;
                        realInput.matches = oldFns.matches;
                        var evt = document.createEvent('HTMLEvents');
                        evt.initEvent('change', false, true);
                        oldFns.dispatchEvent.call(realInput, evt);

                        // clean up
                        fileInput.value = "";
                        document.getElementById('hidetext').value='';
                    };
                    fr.readAsArrayBuffer(file);
                }
            }
        };
    }

    function insertCuteIntoCSS() {
        var css = document.createElement("style");
        css.type = "text/css";
        // calculate lengths
        css.innerHTML = ".sekrit_text { color: #FFDC91; }" +
            ".decision_roll { animation: decision_blinker 0.4s linear 2; color: lightgreen; } @keyframes decision_blinker { 50% { color: green } }" +
            ".planeptune_wins { animation: planeptune_blinker 0.6s linear " + getIterations(0.6) + "; color: mediumpurple; } @keyframes planeptune_blinker { 50% { color: #fff} }"+
            ".lastation_wins { animation: lastation_blinker 0.6s linear " + getIterations(0.6) + "; color: #000; } @keyframes lastation_blinker { 50% { color: #fff} }"+
            ".lowee_wins { animation: lowee_blinker 0.6s linear " + getIterations(0.6) + "; color: #e6e6ff; } @keyframes lowee_blinker { 50% { color: #c59681 }}"+
            ".leanbox_wins { animation: leanbox_blinker 0.6s linear " + getIterations(0.6) + "; color: #4dff4d; } @keyframes leanbox_blinker { 50% { color: #fff} }"+
            ".thousand_pyu { animation: pyu_blinker 0.4s linear " + getIterations(0.4) + "; color: aqua; } @keyframes pyu_blinker { 50% { color: white } }"+
            ".shaking_post { animation: screaming 0.5s linear 0s " + getVibrationIterations() + "; } @keyframes screaming { 0% { -webkit-transform: translate(2px, 1px) rotate(0deg); } 10% { -webkit-transform: translate(-1px, -2px) rotate(-1deg); } 20% { -webkit-transform: translate(-3px, 0px) rotate(1deg); } 30% { -webkit-transform: translate(0px, 2px) rotate(0deg); } 40% { -webkit-transform: translate(1px, -1px) rotate(1deg); } 50% { -webkit-transform: translate(-1px, 2px) rotate(-1deg); } 60% { -webkit-transform: translate(-3px, 1px) rotate(0deg); } 70% { -webkit-transform: translate(2px, 1px) rotate(-1deg); } 80% { -webkit-transform: translate(-1px, -1px) rotate(1deg); } 90% { -webkit-transform: translate(2px, 2px) rotate(0deg); } 100% { -webkit-transform: translate(1px, -2px) rotate(-1deg); } }";
        document.head.appendChild(css);
    }

    function mgcPl_InsertHtmlAndCSS() {
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = "#mgcPlFrame { position: fixed; top: 100px; left: 100px; height: 300px; background-color: black; max-width: 400px;";
        if (!currentlyEnabledOptions.has("megucaplayerOption"))
            css.innerHTML += " display: none;";
        css.innerHTML += " }  .mgcPlPlaylist{ width: 100%; height: 85%; }  .mgcPlControls { height: 20px; width: 80px; }  .mgcPlOptions { display: flex; flex: 1; justify-content: center; width: 100%; }  .mgcPlTitle { color: white; padding: 0; margin: 0; width: 100%; text-align: center; }  .mgcPlSliders { display: flex; margin: 0 5px; }  .mgcPlSeeker { flex: 2; margin: 5px 5px; color: white; }  .mgcPlVolume { flex: 1; margin: 5px 5px; color: white; }";
        document.head.appendChild(css);

        var newdiv = document.createElement("div");
        newdiv.innerHTML = "<div id=\"mgcPlFrame\">  <div class=\"mgcPlOptions2\"> <div draggable=\"true\" id=\"mgcPldragArea\"> <p class=\"mgcPlTitle\">MegucaPlayer</p> <div class=\"mgcPlOptions\"> <button class=\"mgcPlControls\" id=\"mgcPlPrevBut\">prev</button> <button class=\"mgcPlControls\" id=\"mgcPlStopBut\">stop</button> <button class=\"mgcPlControls\" id=\"mgcPlPlayBut\">play/pause</button> <button class=\"mgcPlControls\" id=\"mgcPlNextBut\">next</button> </div> </div> <div class=\"mgcPlSliders\"> <label class=\"mgcPlSeeker\">Seeker: </label> <label class=\"mgcPlVolume\">Volume: </label> </div> <div class=\"mgcPlSliders\"> <input type=\"range\" min=\"0\" max=\"1\" value=\"0\" class=\"mgcPlSeeker\" id=\"mgcPlSeekerSlider\"> <input type=\"range\" min=\"0\" max=\"100\" value=\"100\" class=\"mgcPlVolume\" id=\"mgcPlVolumeSlider\"> </div> </div> <select class=\"mgcPlPlaylist\" multiple id=\"megucaplaylist\"> </select> </div>";
        document.body.appendChild(newdiv);
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
        var expr = math[1].replace(/pow/g, 'Math.pow').replace(/log/g, 'Math.log');
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

    function parseSecretPost(post, secret) {
        var text = secret[1];
        var before = post.innerHTML.substring(0, secret.index);
        var after = post.innerHTML.substring(secret.index + secret[0].length);

        for (var j = 0; j < nipponeseIndex[0].length; j++) {
            text = text.replace(new RegExp(nipponeseIndex[1][j], 'g'), nipponeseIndex[0][j]);
        }

        var decodedMessage = "";
        try {
            decodedMessage = decodeURIComponent(escape(atob(text)));
        } catch (e) {
            return;
        }
        decodedMessage = decodedMessage.replace(new RegExp("<", 'g'), "<󠁂");
        decodedMessage = decodedMessage.replace(new RegExp(">", 'g'), "󠁂>");
        post.innerHTML = before + "<h class=\"sekrit_text\">" + decodedMessage + "</h>" + after;
    }

    function parseSecretQuote(post, secretQuote) {
        var quote = secretQuote[1];
        var before2 = post.innerHTML.substring(0, secretQuote.index);
        var after2 = post.innerHTML.substring(secretQuote.index + secretQuote[0].length);
        if (secretQuote[0].substring(secretQuote[0].length-1) == "<" || secretQuote[0].substring(secretQuote[0].length-1) == " ") {
            after2 = secretQuote[0].substring(secretQuote[0].length-1) + after2;
            secretQuote[0] = secretQuote[0].substring(0,secretQuote[0].length-1);
        }
        quote = "<a class=\"post-link\" data-id=\"" + quote + "\" href=\"#p" + quote + "\">&gt;&gt;" + quote + "</a><a class=\"hash-link\" href=\"#p" + quote + "\"> #</a>";
        post.innerHTML = before2 + " </h>" + quote + after2; //"<h class=sekrit_text> " + 
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
                        if (postItself.getAttribute("class").includes("editing")) {
                            // add Format button to posts the user is making
                            if (currentlyEnabledOptions.has("annoyingFormatting") && postItself.getAttribute("class").includes("reply-form")) {
                                addFormatButton(postItself);
                            }
                            return;
                        }
                        // handlesPost (works for others posters)
                        handlePost(postContent);
                        mgcPl_addNewSong(postItself.getElementsByTagName("figcaption")[0]);

                        // launch observer3 (only works for own posts)
                        var observer3 = new MutationObserver(function(mutations3) {
                            mutations3.forEach(function(mutation3) {
                                handlePost(postContent);
                                mgcPl_addNewSong(postItself.getElementsByTagName("figcaption")[0]);
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

        if (currentlyEnabledOptions.has("imgsekritPosting")) {
            var parsedImages = {}; // cache results so we don't re-parse images

            var secretConfig = { childList: true };
            var secretObserver = new MutationObserver(function(mutations) {
                var mutation = mutations[0]; // only 1 thing will be hovered at a time
                if (mutation.addedNodes.length > 0) {
                    var img = mutation.addedNodes[0];
                    if (img.nodeName != "IMG")
                        return; // hovering over a post, not an image
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
                                responseType: 'blob',
                                onload: function(response) {
                                    // max message length is 999 bytes + 9 byte header
                                    var str = response.responseText.substring(response.responseText.length-1008, response.responseText.length);
                                    var msg = parseSecretImage(img, str);
                                    parsedImages[img.src] = msg;
                                }
                            });
                        };
                        parsedImages[img.src] = null; // set to null for now, will be filled in if there's a message
                    }
                }
            });
            secretObserver.observe(document.getElementById("hover-overlay"), secretConfig);
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
        var format = ["~~","**","__","``"][Math.floor(Math.random()*4)];
        return format + s + format;
    }

    function parseSecretImage(img, str) {
        // the message is added to the end of the image
        // image bytes
        // text of message
        // length of message
        // "secret"

        // check if this contains a secret message
        var header = str.substring(str.length - 6, str.length);
        if (header == "secret") {
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
        var url = new URL(img.src, "https://meguca.org");
        var thumbs = document.querySelectorAll("figure > a[href$='"+url.pathname+"']");
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
        if (name.nextSibling.id == "dumbposter") {
            // already has a name, change it in case the content changed
            name.parentNode.removeChild(name.nextSibling);
        }
        name.parentNode.insertBefore(newText, name.nextSibling);
    }

    function setupImagePaste() {
        var tc = document.getElementById("thread-container");
        tc.addEventListener('paste', function(e){
            var files = e.clipboardData.files;
            // check if a file was pasted
            if (files.length == 1) {
                var possibleInputs = document.getElementsByName("image");
                var realInput;
                for (var i = 0; i < possibleInputs.length; i++) {
                    if (possibleInputs[i].offsetParent != null) {
                        realInput = possibleInputs[i];
                        break;
                    }
                }
                if (realInput == undefined) {
                    // reply isn't started yet, click the button
                    var evt = document.createEvent('HTMLEvents');
                    evt.initEvent('click', true, false);
                    evt.which = 1;
                    var replyButton = document.querySelector("aside.posting > a");
                    replyButton.dispatchEvent(evt);

                    // try to find the input field again
                    possibleInputs = document.getElementsByName("image");
                    for (var i = 0; i < possibleInputs.length; i++) {
                        if (possibleInputs[i].offsetParent != null) {
                            realInput = possibleInputs[i];
                            break;
                        }
                    }
                }

                if (realInput != undefined) {
                    realInput.files = files;
                    var evt = document.createEvent('HTMLEvents');
                    evt.initEvent('change', false, true);
                    realInput.dispatchEvent(evt);
                }
            }
        });
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
        if (currentlyEnabledOptions.has("imagePaste")) setupImagePaste();
    }

    var mgcPl_offset = [];
    var mgcPl_songs = [];
    var mgcPl_meguca_player;
    var mgcPl_currentIndex = -1;
    var mgcPl_volume = 1.0;
    var mgcPl_seekerBar_updater;

    function mgcPl_allowDrop(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'move';
    }

    function mgcPl_drag(ev) {
        var frame = ev.target.parentNode.parentNode;
        ev.dataTransfer.setData("id", frame.id);
        var style = window.getComputedStyle(frame, null);
        mgcPl_offset[0] = parseInt(style.getPropertyValue("left"), 10) - ev.clientX;
        mgcPl_offset[1] = parseInt(style.getPropertyValue("top"), 10) - ev.clientY;
        frame.style.opacity = '0.6';  // this / e.target is the source node.
    }

    function mgcPl_drop(ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("id");
        var thingy = document.getElementById(data);
        thingy.style.left = (ev.clientX + parseInt(mgcPl_offset[0],10)) + 'px';
        thingy.style.top = (ev.clientY + parseInt(mgcPl_offset[1],10)) + 'px';
        thingy.style.opacity = '1';
    }

    function mgcPl_playSelected() {
        mgcPl_play(document.getElementById("megucaplaylist").selectedIndex);
    }

    function mgcPl_play(selectedIndex) {
        if (selectedIndex != mgcPl_currentIndex){
            mgcPl_killPlayer();
            mgcPl_meguca_player = new Audio(mgcPl_songs[selectedIndex][2]);
            mgcPl_currentIndex = selectedIndex;
            mgcPl_meguca_player.addEventListener("ended", function() {mgcPl_playSong(1);});
            mgcPl_meguca_player.volume = mgcPl_volume;

            // Seeker
            var seeker = document.getElementById("mgcPlSeekerSlider");
            seeker.min = 0;
            seeker.max = mgcPl_convertLengthToSecs(mgcPl_songs[selectedIndex][1]);
            seeker.value = 0;
        } else if (!mgcPl_meguca_player.paused) {
            mgcPl_meguca_player.pause();
            return;
        }
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
        if (mgcPl_songs.length > 0 && link === mgcPl_songs[mgcPl_songs.length-1][2]) return;

        if (link.endsWith(".mp3") || link.endsWith(".flac") || link.endsWith(".mp4") || link.endsWith(".ogg")) {
            var songinfo = figcaption.children[2];
            var artistSpan = songinfo.getElementsByClassName("media-artist")[0];
            var titleSpan = songinfo.getElementsByClassName("media-title")[0];
            var durationSpan = songinfo.getElementsByClassName("media-length")[0];

            var name = "";
            if (artistSpan !== undefined && artistSpan.innerHTML !== "")
                name = artistSpan.innerHTML + " - "; // media artist
            if (titleSpan !== undefined && titleSpan.innerHTML !== "")
                name += titleSpan.innerHTML; // title
            if (name === "")
                name = figcaption.children[3].download; // download filename

            var duration = "00:00";
            if (durationSpan !== undefined)
                duration = durationSpan.innerHTML; // duration

            mgcPl_songs.push([name, duration, link]);

            var newOp = document.createElement("option");
            var songInfo = document.createTextNode(duration + " | " + name);
            newOp.appendChild(songInfo);

            var playlist = document.getElementById("megucaplaylist");
            playlist.appendChild(newOp);
        }
    }

    function mgcPl_setupPlaylist() {
        mgcPl_InsertHtmlAndCSS();
        var dm = document.getElementById('mgcPldragArea');
        dm.addEventListener('dragstart',mgcPl_drag,false);
        document.body.addEventListener('dragover',mgcPl_allowDrop,false);
        document.body.addEventListener('drop',mgcPl_drop,false);

        // buttons
        document.getElementById("mgcPlPrevBut").addEventListener("click", function(){mgcPl_playSong(-1);});
        document.getElementById("mgcPlStopBut").addEventListener("click", function(){mgcPl_stopPlayer();});
        document.getElementById("mgcPlPlayBut").addEventListener("click", function(){mgcPl_playSelected();});
        document.getElementById("mgcPlNextBut").addEventListener("click", function(){mgcPl_playSong(1);});
        document.getElementById("megucaplaylist").addEventListener("dblclick", function(){mgcPl_playSelected();});

        // sliders
        var volumeSlider = document.getElementById("mgcPlVolumeSlider");
        volumeSlider.addEventListener("input", function() { mgcPl_updateVolume(this.value); });
        var seekerSlider = document.getElementById("mgcPlSeekerSlider");
        seekerSlider.addEventListener("input", function() { mgcPl_seekTo(this.value); });
        if (currentlyEnabledOptions.has("megucaplayerOption")) mgcPl_seekerBar_updater = setInterval(mgcPl_updateSeekerBar, 1000);

        mgcPl_fetchAllSongs();
    }

    function mgcPl_updateVolume(volume) {
        mgcPl_volume = volume/100.0;
        if (mgcPl_meguca_player !== null && mgcPl_meguca_player !== undefined)
            mgcPl_meguca_player.volume = volume/100.0;
    }

    function mgcPl_seekTo(time) {
        if (mgcPl_meguca_player !== null && mgcPl_meguca_player !== undefined)
            mgcPl_meguca_player.currentTime = time;
    }

    function mgcPl_convertLengthToSecs(string) {
        var midSign = string.indexOf(":");
        var minutes = parseInt(string.substring(0,midSign));
        var seconds = parseInt(string.substring(midSign + 1));
        return (minutes * 60) + seconds;
    }

    function mgcPl_updateSeekerBar() {
        var slider = document.getElementById("mgcPlSeekerSlider");
        if (mgcPl_meguca_player === null || mgcPl_meguca_player === undefined)
            slider.value = 0;
        else
            slider.value = mgcPl_meguca_player.currentTime;
    }

    function downloadAll() {
        var posts = document.getElementById("thread-container").children;
        var filetypes = document.getElementById("steal_filetypes").value.split(" ");
        for (var i = 0; i < posts.length; i++) {
            if (posts[i].tagName.toLowerCase() === "article" &&
                posts[i].children[2].tagName.toLowerCase() === "figcaption") {
                var anchor = posts[i].children[2].children[3];
                for (var j = 0; j < filetypes.length; j++)
                    if (anchor.href.endsWith(filetypes[j]))
                        anchor.click();
            }
        }

    }

    setup();
})();
