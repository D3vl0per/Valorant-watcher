require('dotenv').config();
const puppeteer = require('puppeteer-core');
const dayjs = require('dayjs');
const cheerio = require('cheerio');
var fs = require('fs');
const inquirer = require('./input');

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

const showBrowser = false; // false state equ headless mode;
const proxy = ""; // "ip:port" By https://github.com/Jan710

const browserScreenshot = false;

var browserConfig = {
    headless: !showBrowser
};
// ========================================== CONFIG SECTION =================================================================

(async () => {
    console.clear();
    console.log("=========================");
    var cookie = await readLoginData();
    if (proxy && !process.env.proxy) {
        browserConfig.args = new Array();
        browserConfig.args[0] = '--proxy-server=' + proxy;
    }

    browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();

    console.log('🔧 Set User-Agent');
    await page.setUserAgent(userAgent);

    console.log('🔧 Set auth cookie');
    await page.setCookie(...cookie);

    console.log('⏰ Setting timeouts');
    await page.setDefaultNavigationTimeout(process.env.timeout);
    await page.setDefaultTimeout(process.env.timeout);

    process.stdout.write('🔐 Checking login...  ');
    await checkLogin(page);

    let streamers = await getAllStreamer(page);
    console.log("=========================");
    console.log('📌 Run watcher');

    await viewRandomPage(page, streamers)
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
            browserConfig.executablePath = configFile.exec;
            cookie[0].value = configFile.token;
            return cookie;
        } else if (process.env.token) {
            console.log('✅ Env config found');
            cookie[0].value = process.env.token; //Set cookie from env
            browserConfig.executablePath = process.env.exec; //Set exec path from env. For docker container
            browserConfig.args = new Array();
            browserConfig.args[0] = '--no-sandbox';
            browserConfig.args[1] = '--disable-setuid-sandbox';
            if (process.env.proxy) {
                browserConfig.args[2] = '--proxy-server=' + process.env.proxy;
            }
            return cookie;
        } else {
            console.log('❌ Create config file');
            let input = await inquirer.askLogin();
            fs.writeFile(configPath, JSON.stringify(input), function(err) {
                if (err) {
                    console.log(err);
                }
            });
            browserConfig.executablePath = input.exec;
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
    const jquery = await queryOnWebsite(page, 'a[data-test-selector*="ChannelLink"]');

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

async function viewRandomPage(page, streamers) {
    var last_refresh = dayjs().add(streamerListRefresh, streamerListRefreshUnit);
    while (run) {
        if (dayjs(last_refresh).isBefore(dayjs())) {
            streamers = await getAllStreamer(page);
        }
        let watch = streamers[getRandomInt(0, streamers.length)];
        var sleep = getRandomInt(minWatching, maxWatching) * 60000;
        console.log('\n🔗 Streamer: ', baseUrl + watch);
        await page.goto(baseUrl + watch, {
            "waitUntil": "networkidle2"
        });
        await clickWhenExist(page, 'button[data-a-target="player-overlay-mature-accept"]');
        await page.keyboard.press('m'); //For unmute

        if (browserScreenshot){
          await page.waitFor(1000);
          await page.screenshot({path: 'actual-steamer.png'});
        }
        await clickWhenExist(page, '*[data-test-selector="user-menu__toggle"]')
        let status = await queryOnWebsite(page, 'span[data-a-target="presence-text"]');
        console.log('💡 Status:', status[0].children[0].data);
        await clickWhenExist(page, '*[data-test-selector="user-menu__toggle"]')
        console.log('💤 Watching for ' + sleep / 60000 + ' minutes\n');

        await page.waitFor(sleep);
    }
}

async function checkLogin(page) {
    await page.goto(baseUrl, {
        "waitUntil": "networkidle0"
    });
    let cookieSetByServer = await page.cookies();
    await clickWhenExist(page, 'button[data-a-target="consent-banner-accept"]');
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

async function queryOnWebsite(page, query){
  let bodyHTML = await page.evaluate(() => document.body.innerHTML);
  let $ = cheerio.load(bodyHTML);
  const jquery = $(query);
  return jquery;
}

async function clickWhenExist(page, query) {

  let result = await queryOnWebsite(page, query);
  try {
    if (result[0].type == 'tag' && result[0].name == 'button'){
      await page.click(query)
      await page.waitFor(500);
    }
  } catch (e) {}

}

async function shutDown() {
    console.log("\n👋Bye Bye👋");
    run = false;
    process.exit();
}

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
