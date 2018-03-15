# megukascript
Userscript for the meguca imageboard. Slightly enhances user experience by adding meme and, sometimes, even actually useful features. <br>
Sandbox for some features that eventually got added to the meguca website.<br>
No buttcoin miners (yet!)

## Features
<a href="https://comfy.moe/tawdnt.webm">A quick demonstration of various features</a>  <br />
All of the features can be disabled invidually in the options panel. You need to refresh your browser to see the changes.
### ~~Animated rolls~~
~~Adds animation to max rolls and any repeating digits.~~ <br /> 
~~Duration of flashing is configurable.~~<br>
Now a feature of the meguca website itself.

### Eden now playing banner
Displays Eden Radio information in the now playing banner instead of the r/a/dio one. <br />
Need to disable Now playing banner on the Fun tab to work properly.<br>
Now a feature of the meguca website itself, though you can use it to quickly change between the two radios with some hacks (official functionality soon (maybe)).

### Pyu coloring
Adds a little something every 1000 pyus.

### ~~Roulette~~
~~Adds russian roulette function. Roll a (1) to die.~~<br />
~~Call the function with #roulette #d[1-6]~~
Now a feature of the meguca website itself. Just type #roulette to try killing yourself.

### Decision coloring
Adds simple decision making with dice. <br />
Call the function with <b>[option1, option2, ..., optionN] #dN</b> or just <b>option1, option2, ..., optionN #dN</b>

### Dumb xposters
Identifies dumb posters. <br />
Currently supports dumb blancposters, dumb tildeposters, dumb lowercaseposters and dumb 'dumb xposters' posters. <br>
Will also label haiku anon and virus posters.

### dumb blancposters, not cute
Toggles between tagging blancposters as dumb or cute.

### Shares formatting
Allows for 'share rolls' formatting. Giving multiple choices and highlighting the highest roll. <br />
Call the function with <b>[option1, option2, ..., optionN] #Ndx</b> <br>
Will also display special colors if the winning options are named "Planeptune", "Lastation", "Lowee", or "Leanbox".

### Secret posting
Post messages that only userscript users can read! (Not guaranteed) <br/>
After opening up the post box, just open the secret encoding options tab (Top right gear and then "Secret Encoding"), type your secret message on the "encode text" box, and either "Enter" or the "Convert & input" button. This will add your secret message to the post. This message will be automatically decoded for everyone with the userscript. <br/>
If you add a pic beforehand (right below the encode text box) the message will instead be hidden inside the image. Hover any image to reveal its secret text.

### MegucaPlayer
Music player for all the audio files currently posted (and loaded on the page) on the thread. <br>
Toggle the checkbox at the userscript settings at any time to hide or show the music player. You may drag it across the screen by holding on its titlebar. <br>
The player will automatically list all available music and play them on order, looping around when the playlist reaches its end. Double-clicks on songs works fine and so do all the buttons. Try playing around with it.

### Chuuuuu~
"Chuu~" any user by typing "#chuu([postnumber])"<br>
It will still work if there are spaces inside the brackets like in "#chuu( 1231233 )" but not if it includes the ">>".<br>
Check how many chuu~'s you have received on the settings tab.

## Installation
<ul>
 <li>Install Tampermonkey for <a href="https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?  hl=en">Chrome</a>/<a href="https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/">Firefox</a></li>
 <li><a href="../../raw/master/meguca.user.js">Click here</a>
</ul>
