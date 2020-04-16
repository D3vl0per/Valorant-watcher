require('dotenv').config();
const puppeteer = require('puppeteer');
const dayjs = require('dayjs');
const cheerio = require('cheerio');
var fs = require('fs');
const inquirer = require('./input');
const Nightmare = require('nightmare')

var run = true;
// ========================================== CONFIG SECTION =================================================================
const configPath = './config.json'
const baseUrl = 'https://www.twitch.tv/';
const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36';
const streamersUrl = 'https://www.twitch.tv/directory/game/VALORANT?tl=c2542d6d-cd10-4532-919b-3d19f30a768b';
const scrollDelay = 2000;
const scrollTimes = 5;

const minWatching = 6; // Minutes
const maxWatching = 10; //Minutes

const streamerListRefresh = 2;
const streamerListRefreshUnit = 'hour'; //https://day.js.org/docs/en/manipulate/add

const showBrowser = false;
// ========================================== CONFIG SECTION =================================================================

(async () => {
  console.clear(); console.log("=========================");
  const browserConfig = {
    headless: !showBrowser,
    ignoreDefaultArgs: ['--mute-audio']
  }

  if (process.env.exec){
    browserConfig.executablePath = process.env.exec;
    browserConfig.args = new Array();
    browserConfig.args[0] = '--no-sandbox';
    browserConfig.args[1] = '--disable-setuid-sandbox';
    if (process.env.proxy) {
      browserConfig.args[2] = '--proxy-server=' + process.env.proxy;
    }
  }

  browser = await puppeteer.launch(browserConfig);
  const page = await browser.newPage();

  console.log('🔧 Set User-Agent');
  await page.setUserAgent(userAgent);

  var cookie = await readLoginData();
  console.log('🔧 Set auth cookie');
  await page.setCookie(...cookie);

  process.stdout.write('🔐 Checking login...  ');
  await checkLogin(page);


  let streamers = await getAllStreamer(page);
  console.log("=========================");
  console.log('📌 Run watcher');

  await viewRandomPage(cookie, page, streamers)
  await browser.close();
})();

async function readLoginData() {
  const cookie = [{
    "domain": ".twitch.tv",
    "hostOnly": false,
    "httpOnly": false,
    "name": "auth-token",
    "path": "/",
    "sameSite": "no_restriction",
    "secure": true,
    "session": false,
    "storeId": "0",
    "id": 1
  }];
  try {
    process.stdout.write('🔎 Check config file...  ');

    if (fs.existsSync(configPath)) {
      console.log('✅ Json config found');
      let configFile = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        cookie[0].value = configFile.token;
        return cookie;
    } else if (process.env.token) {
      console.log('✅ Env config found');
      cookie[0].value = process.env.token;
      return cookie;
    } else {
      console.log('❌ Create config file');
      let input = await inquirer.askLogin();
      fs.writeFile(configPath, JSON.stringify(input), function(err) {
        if (err) {
          console.log(err);
        }
      });

      cookie[0].value = input.token;
      return cookie;
    }
  } catch (err) {
    console.error(err)
  }
}

async function getAllStreamer(page) {
  console.log("=========================");
  console.log('📡 Check active streamers');
  console.log('📨 Go to Twitch.tv');
  console.log('⏰ Waiting for loading...');
  await page.goto(streamersUrl, {
    "waitUntil": "networkidle0"
  });
  await scroll(page, scrollTimes);

  let bodyHTML = await page.evaluate(() => document.body.innerHTML);
  let $ = cheerio.load(bodyHTML);
  const jquery = $('a[data-test-selector*="ChannelLink"]');

  let streamers = new Array();

  console.log('🚮 Filter out html codes');
  for (var i = 0; i < jquery.length; i++) {
    streamers[i] = jquery[i].attribs.href.split("/")[1]
  }
  return streamers;
}

async function scroll(page, times) {
  console.log('🔨 Emulate the scrolling...');
  for (var i = 0; i < times; i++) {
    await page.evaluate(async (page) => {
      var x = document.getElementsByClassName("scrollable-trigger__wrapper");
      x[0].scrollIntoView();
    });
    await page.waitFor(scrollDelay);
  }
}

async function viewRandomPage(cookie, page, streamers) {
  const nightmare = Nightmare({
    show: showBrowser,
    waitTimeout: maxWatching * 60000
  })
  await nightmare.goto(baseUrl);
  await nightmare.cookies.set('auth-token', cookie[0].value);
  var last_refresh = dayjs().add(streamerListRefresh, );
  while (run) {
    if (dayjs(last_refresh).isBefore(dayjs())) {
      streamers = await getAllStreamer(page);
    }
    let watch = streamers[getRandomInt(0, streamers.length)];
    var sleep = getRandomInt(minWatching, maxWatching) * 60000;

    console.log('\n🔗 Streamer: ', baseUrl + watch);
    await nightmare.goto(baseUrl + watch);
    console.log('💤 Watching for ' + sleep / 60000 + ' minutes\n');

    await nightmare.wait(sleep);
  }
}

async function checkLogin(page) {
  await page.goto(baseUrl, {
    "waitUntil": "networkidle0"
  });
  let cookieSetByServer = await page.cookies();
  for (var i = 0; i < cookieSetByServer.length; i++) {
    if (cookieSetByServer[i].name == 'twilight-user') {
      console.log('✅ Login successful');
      return true;
    }
  }
  console.log('\n🛑 Login failed!');
  console.log('🔑 Wrong token!');
  if (!process.env.token) {
    fs.unlinkSync(configPath);
  }
  process.exit()
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function shutDown() {
  console.log("\n👋Bye Bye👋");
  run = false;
  process.exit();
}

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
