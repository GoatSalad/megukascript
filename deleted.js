var modlog;
var fetchingModlog = false;
var postsToCheck = [];
var postsToCheckAgain = [];

function shouldHandleDeleted(post) {
    return (post.parentNode.classList.contains("deleted") &&
            post.parentNode.querySelector(':scope > text[style="color: red;"]') == null);
}

function shouldHandleBanned(post) {
    return (post.querySelector('.admin.banned') != null &&
            post.querySelector('div[style="color: red;"]') == null);
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
        responseType: 'text',
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

function checkForPostInModlog(posts) {
    var result = [];
    for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        var id = post.parentNode.id.substring(1);
        var retry = false;
        if (shouldHandleDeleted(post)) {
            var delNode = post.parentNode.getElementsByClassName("deleted-toggle")[0];
            var matches = modlog.match(new RegExp("<td>Delete post<\/td><td>([^<]*)<\/td><td><a class=\"post-link\" data-id=\"" + id + "\""));
            // posts deleted a long time ago may no longer have entries in the mod-log
            if (matches != null && matches[1] != undefined && delNode != undefined) {
                // add the text below the deleted icon
                var txt = document.createElement("text");
                txt.textContent = "Deleted by " + matches[1];
                txt.style.color = "red";
                delNode.parentNode.insertBefore(txt, delNode.nextSibling);
            } else {
                retry = true;
            }
        }
        if (shouldHandleBanned(post)) {
            var banNode = post.querySelector('.admin.banned');
            //Type By Post Time Reason Duration
            var banMatches = modlog.match(new RegExp("<td>Ban<\/td>"+
                                                     "<td>((?:(?!<\/td>).)+)<\/td>"+
                                                     "<td><a class=\"post-link\" data-id=\"" + id + "\"(?:(?!<\/td>).)+<\/td>"+
                                                     "<td>(?:(?!<\/td>).)+<\/td>"+
                                                     "<td>((?:(?!<\/td>).)+)<\/td>"+
                                                     "<td>((?:(?!<\/td>).)+)<\/td>"));
            // posts deleted a long time ago may no longer have entries in the mod-log
            if (banMatches != null && banMatches[1] != undefined && banNode != undefined) {
                // add the text below the banned message
                var banTxt = document.createElement("div");
                banTxt.textContent = "\nBanned by " + banMatches[1] + " for " + banMatches[2] + " (" + banMatches[3] + ")";
                banTxt.style.color = "red";
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
