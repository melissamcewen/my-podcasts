const parsePodcast = require('node-podcast-parser');
const http = require('https');
const { URL } = require('url');
const fs = require('fs');
const axios = require('axios');

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
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then(function(response) {
        //console.log(response);
        parsePodcast(response.data, (err, data) => {
          if (err) {
            console.error('Parsing error', err);
            return;
          }

          resolve(data);
        });
      })
      .catch(function(error) {
        console.log(error);
      });
  });
}
async function getFeed(podcasts) {
  console.log(podcasts);
  let promisePodcasts = [];
  let values = [];
  podcasts.forEach((podcast) => {
    promisePodcasts.push(refreshPodcast(podcast));
  });

  return Promise.all(promisePodcasts).then(function(values) {
    let formatted = podcastLinks(values);
    fs.writeFileSync('public/feed.json', JSON.stringify(formatted, null, 2));
    console.log(formatted);
    return Promise.resolve(formatted);
  });
}

module.exports = {
  podcastLinks: podcastLinks,
  refreshPodcast: refreshPodcast,
  getFeed: getFeed,
};
