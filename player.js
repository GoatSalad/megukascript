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
