const nipponeseIndex = ["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                        "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんゃゅょ心無日口二手山木糸羽雨辵水金色何"];

function secretButtonPressed() {
    var fileInput = document.getElementById("secret_image");
    var file = fileInput.files[0] || fileInput.javascriptIsFuckingDumb; // sometimes fileInput.files gets reset, so we keep a copy of the file in another property
    if (document.getElementById('text-input')!=null) {
        if (!file) {
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
                fileInput.javascriptIsFuckingDumb = undefined;
                document.getElementById('hidetext').value='';
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
    var baseURL = new URL(window.location).origin;
    var url = new URL(img.src, baseURL);
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

function setupSecretObserver() {
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
