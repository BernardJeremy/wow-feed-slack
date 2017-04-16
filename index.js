const fs = require('fs');
const http = require('http');
const Slack = require('slack-node');
const cheerio = require('cheerio');

// Retrieve config
const config = require('./config.json');


// Import parser
const Parser = require('./parser.js');


// Return if parameter is an array
function isArray(a) {
  return (!!a) && (a.constructor === Array);
}

// Hash the string
function hashString(str) {
  let hash = 0;
  let i;
  let chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i += 1) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// Send the slack message to the config's webhook
function sendSlackMessage(text, target) {
  const msgParameters = {
    text: `*${target.name[0].toUpperCase() + target.name.slice(1)}* : ${text}`,
  };
  const slack = new Slack();
  slack.setWebhook(config.slackHookUrl);
  slack.webhook(msgParameters, (err, response) => {
    if (response.statusCode !== 200) {
      console.log(err, response);
    }
  });
}

// return filename
function getSaveFilename() {
  return 'saved_wow_feed.json';
}

// Perform update of the save data file
function updateSavedData(savedData) {
  if (fs.existsSync(getSaveFilename())) {
    fs.unlinkSync(getSaveFilename());
  }
  fs.writeFileSync(getSaveFilename(), JSON.stringify(savedData));
}

// return potential saved data from file
function getSavedData() {
  let savedData = {};
  if (fs.existsSync(getSaveFilename())) {
    savedData = JSON.parse(fs.readFileSync(getSaveFilename(), 'utf8'));
  }

  return savedData;
}

// iterate over activities and send new one to slack
function feedNotifier(response, hostname, path, target) {
  const savedData = getSavedData();

  const $ = cheerio.load(response);
  const collection = $('.activity-feed li dl dd');
  const parser = new Parser();

  if (Object.keys(savedData).length === 0 || !savedData[target.name] || Object.keys(savedData[target.name]).length === 0 || !savedData[target.name].last) {
    savedData[target.name] = {};
    savedData[target.name].last = hashString(parser.parse(collection[2].children, hostname + path));
    updateSavedData(savedData);
  } else {
    let i = 0;

    for (i = 0; i < collection.length; i += 1) {
      const text = parser.parse(collection[i].children, hostname + path);
      if (savedData[target.name].last === hashString(text)) {
        break;
      }
    }

    for (let j = i - 1; j >= 0; j -= 1) {
      const text = parser.parse(collection[j].children, hostname + path);
      if (savedData[target.name].last === hashString(text)) {
        break;
      }
      sendSlackMessage(text, target);
    }

    savedData[target.name].last = hashString(parser.parse(collection[0].children, hostname + path));
    updateSavedData(savedData);
  }
}


// execute request to armory
function execute(target) {
  const hostname = config.hostname.replace('%r%', target.region);
  const path = config.path.replace('%l%', config.lang).replace('%s%', target.realm).replace('%c%', target.name);
  const options = {
    hostname: hostname.replace('http://', ''),
    path,
    method: 'get',
  };

  const callback = (res) => {
    let response = '';
    res.setEncoding('utf8');
    res.on('data', (body) => {
      response += body;
    });
    res.on('end', () => {
      feedNotifier(response, hostname, path, target);
    });
  };

  const req = http.request(options, callback);

  req.on('error', (e) => {
    console.log(`Problem with request: ${e.message}`);
  });

  req.end();
}

if (isArray(config.watch)) {
  config.watch.forEach((target) => {
    execute(target);
  });
} else {
  execute(config.watch);
}
