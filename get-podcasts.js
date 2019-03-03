const parsePodcast = require('node-podcast-parser');
const http = require('https');
const { URL } = require('url');
const fs = require('fs');

function podcastLinks(data) {
  let podcastLinkFeed = [];
  data.forEach(function(podcast) {
    let podcastTitle = podcast.title;
    let episodes = podcast.episodes;
    episodes.forEach(function(episode) {
      let link = {};
      link.podcast = podcastTitle;
      link.title = episode.title;
      link.url = episode.enclosure.url;
      link.date = episode.published;
      podcastLinkFeed.push(link);
    });
  });

  podcastLinkFeed.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  return podcastLinkFeed;
}

// ok so this requests the xml feed and formats it
function refreshPodcast(url) {
  const myURL = new URL(url);
  const hostname = myURL.hostname;
  let pathname = myURL.pathname;

  // hmm probably should have used request oh well
  if (myURL.search) {
    console.log('queries');
    pathname += myURL.search;
  }
  return new Promise((resolve, reject) => {
    let options = {
      method: 'GET',
      hostname: hostname,
      port: null,
      path: pathname,
      headers: {
        'content-length': '0'
      }
    };
    // save locally
    //const file = fs.createWriteStream('public/file.xml');

    var req = http.request(options, function(res) {
      var chunks = [];
      //res.pipe(file);

      res.on('data', function(chunk) {
        chunks.push(chunk);
      });

      res.on('end', function() {
        var body = Buffer.concat(chunks);
        var body2 = body.toString();
        parsePodcast(body2, (err, data) => {
          console.log('parsing podcast');

          resolve(data);
        });
      });
    });
    req.on('error', function(err) {
      // This is not a 'Second reject', just a different sort of failure
      reject(err);
    });

    req.end();
  });
}
function getFeed(podcasts) {
  console.log(podcasts);
  let promisePodcasts = [];
  podcasts.forEach(podcast => {
    promisePodcasts.push(refreshPodcast(podcast));
  });
  return Promise.all(promisePodcasts).then(function(values) {
    let formatted = podcastLinks(values);
    fs.writeFileSync('public/feed.json', JSON.stringify(formatted, null, 2));

    return Promise.resolve(formatted);
  });
}

module.exports = {
  podcastLinks: podcastLinks,
  refreshPodcast: refreshPodcast,
  getFeed: getFeed
};
