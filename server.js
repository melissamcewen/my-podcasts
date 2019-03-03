const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit');


const myPodcasts = require('./podcasts');
const getPodcasts = require('./get-podcasts');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
app.get('/api/podcasts', async (req, res) => {
  let subscriptions = myPodcasts.list;
  let podcasts = await getPodcasts.getFeed(subscriptions);
  console.log(podcasts);
  res.status(200).json(podcasts);
});

 
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
 
// only apply to requests that begin with /api/
app.use("/api/", apiLimiter);

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
