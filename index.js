require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');
const { URL } = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Database to store URLs
let urlDatabase = [];
let id = 1;

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// Post API to shorten URL and respond
app.post('/api/shorturl', function (req, res) {
  const url = req.body.url;

  // Validate URL format (must start with http:// or https://)
  const urlRegex = /^(http|https):\/\/[^ "]+$/;

  if (!urlRegex.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Parse the URL
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  const hostname = parsedUrl.hostname;

  console.log(hostname);
  // DNS lookup to validate the hostname
  dns.lookup(hostname, (err, address) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const shortUrlEntry = {
        original_url: url,
        short_url: id
      };

      // Add URL to database and increment ID
      urlDatabase.push(shortUrlEntry);
      id++;
      res.json({
        original_url: shortUrlEntry.original_url,
        short_url: shortUrlEntry.short_url
      });
    }
  });
});

// Redirect using the short URL
app.get('/api/shorturl/:short_url', function (req, res) {
  const shorturl_id = parseInt(req.params.short_url);

  // Find the entry using the short URL ID
  const foundUrl = urlDatabase.find(entry => entry.short_url === shorturl_id);

  if (foundUrl) {
    // Redirect to the original URL
    return res.redirect(foundUrl.original_url);
  } else {
    return res.json({ error: "invalid url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
