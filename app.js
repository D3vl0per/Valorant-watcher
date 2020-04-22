require('dotenv').config();
const puppeteer = require('puppeteer-core');
const dayjs = require('dayjs');
const cheerio = require('cheerio');
var fs = require('fs');
const inquirer = require('./input');

var run = true;
// ========================================== CONFIG SECTION =================================================================
const configPath = './config.json'
const screenshotFolder = './screenshots/';
const baseUrl = 'https://www.twitch.tv/';
const userAgent =  (process.env.userAgent || 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
const streamersUrl = (process.env.streamersUrl || 'https://www.twitch.tv/directory/game/VALORANT?tl=c2542d6d-cd10-4532-919b-3d19f30a768b');

const scrollDelay = (Number(process.env.scrollDelay) || 2000);
const scrollTimes = (Number(process.env.scrollTimes) || 5);

const minWatching = (Number(process.env.minWatching) || 6); // Minutes
const maxWatching = (Number(process.env.maxWatching) || 15); //Minutes

const streamerListRefresh = (Number(process.env.streamerListRefresh) || 2);
const streamerListRefreshUnit = (process.env.streamerListRefreshUnit || 'hour'); //https://day.js.org/docs/en/manipulate/add

const showBrowser = false; // false state equ headless mode;
const proxy = (process.env.proxy || ""); // "ip:port" By https://github.com/Jan710

const browserScreenshot = (process.env.browserScreenshot || false);

var browserConfig = {
    headless: !showBrowser,
    args:[
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
};//https://github.com/D3vl0per/Valorant-watcher/issues/24

const cookiePolicyQuery = 'button[data-a-target="consent-banner-accept"]';
const matureContentQuery = 'button[data-a-target="player-overlay-mature-accept"]';
const sidebarQuery = '*[data-test-selector="user-menu__toggle"]';
const userStatusQuery = 'span[data-a-target="presence-text"]';
const channelsQuery = 'a[data-test-selector*="ChannelLink"]';
// ========================================== CONFIG SECTION =================================================================



async function main(){
    console.clear();
    console.log("=========================");

    var cookie = await readLoginData();

    browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();

    console.log('🔧 Set User-Agent');
    await page.setUserAgent(userAgent); //Set userAgent

    console.log('🔧 Set auth cookie');
    await page.setCookie(...cookie); //Set cookie

    console.log('⏰ Setting timeouts');
    await page.setDefaultNavigationTimeout(process.env.timeout || 30000);
    await page.setDefaultTimeout(process.env.timeout || 30000);

    process.stdout.write('🔐 Checking login...  ');
    await checkLogin(page);

    let streamers = await getAllStreamer(page);
    console.log("=========================");
    console.log('📌 Run watcher');

    await viewRandomPage(page, streamers)
    await browser.close();
};



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

            if (proxy) browserConfig.args.push('--proxy-server=' + proxy);
            browserConfig.executablePath = configFile.exec;
            cookie[0].value = configFile.token;

            return cookie;
        } else if (process.env.token) {
            console.log('✅ Env config found');

            if (proxy) browserConfig.args.push('--proxy-server=' + proxy);
            cookie[0].value = process.env.token; //Set cookie from env
            browserConfig.executablePath = '/usr/bin/chromium-browser'; //For docker container

            return cookie;
        } else {
            console.log('❌ Create config file');

            let input = await inquirer.askLogin();

            fs.writeFile(configPath, JSON.stringify(input), function(err) {
                if (err) {
                    console.log(err);
                }
            });

            if (proxy) browserConfig.args[6] = '--proxy-server=' + proxy;
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
    console.log('⏰ Waiting for Twitch.tv loading...');
    await page.goto(streamersUrl, {
        "waitUntil": "networkidle0"
    });
    await scroll(page, scrollTimes);
    const jquery = await queryOnWebsite(page, channelsQuery);

    let streamers = new Array();

    console.log('🧹 Filter out html codes');
    for (var i = 0; i < jquery.length; i++) {
        streamers[i] = jquery[i].attribs.href.split("/")[1];
    }
    return streamers;
}



async function viewRandomPage(page, streamers) {
    var last_refresh = dayjs().add(streamerListRefresh, streamerListRefreshUnit);
    while (run) {
        if (dayjs(last_refresh).isBefore(dayjs())) {
            streamers = await getAllStreamer(page); //Call getAllStreamer function and refresh the list
            last_refresh = dayjs().add(streamerListRefresh, streamerListRefreshUnit);//https://github.com/D3vl0per/Valorant-watcher/issues/25
        }
        let watch = streamers[getRandomInt(0, streamers.length-1)]; //https://github.com/D3vl0per/Valorant-watcher/issues/27
        var sleep = getRandomInt(minWatching, maxWatching) * 60000; //Set watuching timer

        console.log('\n🔗 Streamer: ', baseUrl + watch);

        await page.goto(baseUrl + watch, {
            "waitUntil": "networkidle2"
        });//https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagegobackoptions

        await clickWhenExist(page, matureContentQuery);//Click on accept button

        await page.keyboard.press('m'); //For unmute

        if (browserScreenshot){
          await page.waitFor(1000);
          fs.access(screenshotFolder, error => {
              if (error) {
                fs.promises.mkdir(screenshotFolder);
              }
          });
          await page.screenshot({path: `${screenshotFolder}${watch}.png`});
        }

        await clickWhenExist(page, sidebarQuery); //Open sidebar
        let status = await queryOnWebsite(page, userStatusQuery); //status jQuery
        console.log('💡 Your account status:', status[0].children[0].data);
        await clickWhenExist(page, sidebarQuery); //Close sidebar
        console.log('🕒 Time: ' + dayjs().format('HH:mm:ss'));
        console.log('💤 I\'ll watch this for ' + sleep / 60000 + ' minutes\n');

        await page.waitFor(sleep);
    }
}



async function checkLogin(page) {
    await page.goto(baseUrl, {
        "waitUntil": "networkidle0"
    });//https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagegobackoptions

    let cookieSetByServer = await page.cookies();
    await clickWhenExist(page, cookiePolicyQuery);

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

    process.exit();
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



async function shutDown() {
    console.log("\n👋Bye Bye👋");
    run = false;
    process.exit();
}

main();

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
