// ==UserScript==
// @name        megucascript
// @namespace   megucasoft
// @description Does a lot of stuff
// @require     options.js
// @require     player.js
// @require     secret.js
// @require     deleted.js
// @include     https://meguca.org/*
// @include     https://chiru.no/*
// @connect     meguca.org
// @connect     chiru.no
// @version     2.7.1
// @author      medukasthegucas
// @grant       GM_xmlhttpRequest
// ==/UserScript==

//global scope
(function() {

    const defaultFiletypes = ".jpg .png .gif";
    var chuuCount = 0;

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
            var math = findMultipleShitFromAString(post.innerHTML, /#math\(((?:[\d-+/*%()., ]*(?:pow)*(?:log)*)*)\)/g);
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
            checkForDeletedPost(post);
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

    // First layer of observers watches the thread
    // Second layers watches for when the post finishes
    // Third layer for when the server updates the post

    function setObservers() {
        var thread = document.getElementById("thread-container");

        // configuration of the observers:
        var config = { attributes: true, childList: true, subtree: true };
        var config2 = { attributes: true };
        var configCancelposter = { attributes: true, childList: true , subtree: true };

        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length == 0) {
                    // check for deleted posts
                    if (mutation.type == "attributes" && mutation.attributeName == "class") {
                        var post = mutation.target;
                        var postContent = post.getElementsByClassName("post-container")[0];
                        if (postContent != undefined) {
                            if (currentlyEnabledOptions.has("showWhoDeletedPosts")) {
                                checkForDeletedPost(postContent);
                            }
                            if (currentlyEnabledOptions.has("showDeletedPosts")) {
                                showDeletedPost(postContent);
                            }
                        }
                    }
                    return;
                }
                var postItself = mutation.addedNodes[0];
                if (postItself.nodeName != "ARTICLE") {
                    return;
                }
                var postContent = mutation.addedNodes[0].getElementsByClassName("post-container")[0];
                if (postContent == undefined) {
                    return;
                }

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

                if (currentlyEnabledOptions.has("cancelposters")) {
                    // watch for deleted posts
                    var observerCancelposter = new MutationObserver(function(mutations) {
                        // stop observing once the post is not editing, or the post is hidden
                        if (!postItself.classList.contains("editing") || postItself.classList.contains("hidden")) {
                            observerCancelposter.disconnect();
                        }

                        // unhide removed posts, and restore their contents
                        if (postItself.classList.contains("hidden")) {
                            // look for events that removed nodes
                            var cancelled = false;
                            for (var j = 0; j < mutations.length; j++) {
                                var removeEvt = mutations[j];
                                if (removeEvt.type == "childList") {
                                    for (var i = 0; i < removeEvt.removedNodes.length; i++) {
                                        var node = removeEvt.removedNodes[i];
                                        // don't re-add the 'Hide, Report' menu if it disappeared
                                        if (!node.classList || !node.classList.contains("popup-menu")) {
                                            removeEvt.target.appendChild(removeEvt.removedNodes[i]);
                                            cancelled = true;
                                        }
                                    }
                                }
                            }

                            // restore the post if it was probably cancelled
                            if (cancelled) {
                                postItself.classList.remove("hidden");
                                postItself.style.opacity = "0.5";
                                // flag the post as cancelled so we add the correct 'dumb xposter' later
                                postContent.cancelled = true;
                                // somewhere along the way, the default image-hover listener breaks
                                // so just prevent it from running to avoid console errors
                                postItself.addEventListener("mousemove", function(e){e.stopPropagation();});
                            }
                        }
                    });

                    // pass in the target node, as well as the observer options
                    observerCancelposter.observe(postItself, configCancelposter);
                }
            });
        });

        // pass in the target node, as well as the observer options
        observer.observe(thread, config);

        if (currentlyEnabledOptions.has("imgsekritPosting")) {
            setupSecretObserver();
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

    function setupImagePaste() {
        var tc = document.getElementById("thread-container");
        if (!tc) return;
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

        if (currentlyEnabledOptions.has("sekritPosting")) {
            var hideBox = document.getElementById("hidetext");
            if (!hideBox) return;
            hideBox.addEventListener('paste', function(e){
                var files = e.clipboardData.files;
                // check if a file was pasted
                if (files.length == 1) {
                    var secretImage = document.getElementById("secret_image");

                    if (secretImage != undefined) {
                        secretImage.files = files;
                        secretImage.javascriptIsFuckingDumb = files[0]; // secretImage.files seems to get cleared automatically
                    }
                }
            });
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
        if (currentlyEnabledOptions.has("imagePaste")) setupImagePaste();
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

    setup();
})();
