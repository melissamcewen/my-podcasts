var player = document.getElementById('audio_file'); // id for audio element
var duration; // Duration of audio clip
let btnPlayPause = document.getElementById('btnPlayPause');
let progressBar = document.getElementById('progress-bar');
let emojiBar = document.getElementById('emoji-bar');

let volumeBar = document.getElementById('volume-bar');
let source = document.getElementById('audioSource');
let episodes = document.getElementsByClassName('episode');
const podcastList = document.getElementById('podcasts');

function updatePodcasts() {
  console.log('get podcasts');
  return fetch('api/podcasts')
    .then((res) => res.json())
    .then((resJson) => {
      if (resJson.error) {
        console.log(resJson.error);
      } else {
        let stuff = resJson.slice(0, 20);
        formatPodcasts(stuff);
      }
      return Promise.resolve();
    });
}

function listPodcasts() {
  console.log('get podcasts');
  return fetch('/feed.json')
    .then((res) => res.json())
    .then((resJson) => {
      if (resJson.error) {
        console.log(resJson.error);
      } else {
        let stuff = resJson.slice(0, 20);
        formatPodcasts(stuff);
      }
      return Promise.resolve();
    });
}

listPodcasts();

function formatPodcasts(data) {
  podcastList.innerHTML = '';
  let count = 1;
  // iterate through every dream and add it to our page
  data.forEach(function(podcast) {
    // text for things
    const podcastDate = new Date(podcast.date);
    const date = podcastDate.getDate();
    const month = podcastDate.getMonth();
    const year = podcastDate.getFullYear();
    const monthDateYear = month + 1 + '/' + date + '/' + year;
    const episodeDate = document.createTextNode(monthDateYear + ' ');
    const episodeTitle = document.createTextNode(podcast.title + ' ');

    const podcastInfo = document.createTextNode(podcast.podcast + ' ');

    // create elements
    const download = document.createTextNode('⬇️ mp3');
    const playButton = document.createElement('button');
    const newListItem = document.createElement('li');
    const a = document.createElement('a');
    const em = document.createElement('em');
    const span = document.createElement('span');

    em.appendChild(podcastInfo);
    const strong = document.createElement('strong');
    strong.appendChild(episodeDate);
    span.appendChild(episodeTitle);

    playButton.innerHTML = 'Play';
    playButton.addEventListener('click', changeAudio, false);
    playButton.classList.add('playthis');
    playButton.classList.add('mybutton');

    a.appendChild(download);
    a.title = podcast.title;
    a.href = podcast.url;
    a.classList.add('mybutton');

    //put this together :(
    newListItem.appendChild(strong);
    newListItem.appendChild(span);
    newListItem.appendChild(em);
    newListItem.appendChild(playButton);
    newListItem.appendChild(a);
    newListItem.classList.add('episode');
    newListItem.setAttribute('data-playlist', count);
    podcastList.appendChild(newListItem);
    count++;
  });
  // load first audio file
  let button1 = document.getElementsByClassName('playthis')[0];
  let sibs_a = getSiblings(button1);
  let mp3;
  sibs_a.forEach((element) => {
    if (element.href) {
      mp3 = element.href;
    }
  });
  source.src = mp3;
  player.setAttribute('data-playlist', 1);

  player.load();
}

//Emoji Audio

// Add a listener for the timeupdate event so we can update the progress bar

progressBar.addEventListener('click', seek);

function seek(e) {
  var percent = e.offsetX / this.offsetWidth;
  player.currentTime = percent * player.duration;
  e.target.value = Math.floor(percent / 100);
  e.target.innerHTML = progressBar.value + '% played';
}

// Stop the current media from playing, and return it to the start position
function playPauseAudio() {

  if (player.paused) {

    player.play();
  } else {
    player.pause();
  }
}

// Update the progress bar
function updateProgressBar() {
  // Work out how much of the media has played via the duration and currentTime parameters
  var percentage = Math.floor((100 / player.duration) * player.currentTime);
  // Update the progress bar's value
  progressBar.value = percentage;
  // Update the progress bar's text (for browsers that don't support the progress element)
  progressBar.innerHTML = progressBar.title = percentage + '% played';
}

/* podcast specific */

var getSiblings = function(elem) {
  // Setup siblings array and get the first sibling
  var siblings = [];
  var sibling = elem.parentNode.firstChild;

  // Loop through each sibling and push to the array
  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== elem) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling;
  }

  return siblings;
};

var changeAudio = function() {
  let sibs_a = getSiblings(this);
  player.removeEventListener('timeupdate', updateProgressBar, false);

  let mp3;
  sibs_a.forEach((element) => {
    if (element.href) {
      mp3 = element.href;
    }
  });
  source.src = mp3;

  //change the track number
  let trackNumber = this.parentNode.getAttribute('data-playlist');
  player.setAttribute('data-playlist', trackNumber);

  player.load();
  /*player.addEventListener('loadedmetadata', function(_event) {
    player.addEventListener('timeupdate', updateProgressBar, false);
  });*/
  player.play(); //call this to just preload the audio without playing
};

player.onended = function() {
  //ok play the next one
  let lastTrack = player.getAttribute('data-playlist');
  let nextTrack = Number(lastTrack) + 1;
  for (var i = 0; i < episodes.length; i++) {
    let episodeNumber = episodes[i].getAttribute('data-playlist');
    if (episodeNumber == nextTrack) {
      let mp3 = episodes[i].getElementsByTagName('a')[0].href;
      player.removeEventListener('timeupdate', updateProgressBar, false);
     
      source.src = mp3;
      player.setAttribute('data-playlist', nextTrack);
      player.load();

      player.play();
    }
  }
};


 player.addEventListener('loadedmetadata', function(_event) {
        player.addEventListener('timeupdate', updateProgressBar, false);
      });

// service worker

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js')
    .then(function(reg) {
      if (reg.installing) {
        console.log('Service worker installing');
      } else if (reg.waiting) {
        console.log('Service worker installed');
      } else if (reg.active) {
        console.log('Service worker active');
      }
    })
    .catch(function(error) {
      // registration failed
      console.log('Registration failed with ' + error);
    });
}
