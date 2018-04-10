var modlog;
var fetchingModlog = false;
var postsToCheck = [];
var postsToCheckAgain = [];

function checkForDeletedPost(post) {
    if (post.parentNode.classList.contains("deleted") &&
        post.parentNode.querySelector('text[style="color: red;"]') == null) {
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
