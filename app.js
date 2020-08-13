require('dotenv').config();
const puppeteer = require('puppeteer-core');
const dayjs = require('dayjs');
const cheerio = require('cheerio');
var fs = require('fs');
const inquirer = require('./input');
const treekill = require('tree-kill');

var run = true;
var firstRun = true;
var cookie = null;
var streamers = null;
var PreviousChannelName = null;

// ========================================== CONFIG SECTION =================================================================
const configPath = './config.json'
const screenshotFolder = './screenshots/';
const baseUrl = 'https://www.twitch.tv/';
const userAgent = (process.env.userAgent || 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
const streamersUrl = (process.env.streamersUrl || 'https://www.twitch.tv/directory/game/VALORANT?tl=c2542d6d-cd10-4532-919b-3d19f30a768b');
const ChannelName_1 = (process.env.ChannelName_1 || 'NoValueSet');
const ChannelName_2 = (process.env.ChannelName_2 || 'NoValueSet');
const ChannelName_3 = (process.env.ChannelName_3 || 'NoValueSet');
const IgnoreRandomChannels = (process.env.IgnoreRandomChannels || FALSE );


const scrollDelay = (Number(process.env.scrollDelay) || 2000);
const scrollTimes = (Number(process.env.scrollTimes) || 5);

const minWatching = (Number(process.env.minWatching) || 15); // Minutes
const maxWatching = (Number(process.env.maxWatching) || 30); //Minutes

const streamerListRefresh = (Number(process.env.streamerListRefresh) || 1);
const streamerListRefreshUnit = (process.env.streamerListRefreshUnit || 'hour'); //https://day.js.org/docs/en/manipulate/add

const showBrowser = false; // false state equ headless mode;
const proxy = (process.env.proxy || ""); // "ip:port" By https://github.com/Jan710
const proxyAuth = (process.env.proxyAuth || "");

const browserScreenshot = (process.env.browserScreenshot || false);

const browserClean = 1;
const browserCleanUnit = 'hour';

var browserConfig = {
  headless: !showBrowser,
  args: [
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]
}; //https://github.com/D3vl0per/Valorant-watcher/issues/24

const cookiePolicyQuery = 'button[data-a-target="consent-banner-accept"]';
const matureContentQuery = 'button[data-a-target="player-overlay-mature-accept"]';
const sidebarQuery = '*[data-test-selector="user-menu__toggle"]';
const userStatusQuery = 'span[data-a-target="presence-text"]';
const channelsQuery = 'a[data-test-selector*="ChannelLink"]';
const streamPauseQuery = 'button[data-a-target="player-play-pause-button"]';
const streamSettingsQuery = '[data-a-target="player-settings-button"]';
const streamQualitySettingQuery = '[data-a-target="player-settings-menu-item-quality"]';
const streamQualityQuery = 'input[data-a-target="tw-radio"]';
// ========================================== CONFIG SECTION =================================================================



async function ViewPriority(browser,page) {
  var streamer_last_refresh = dayjs().add(streamerListRefresh, streamerListRefreshUnit);
  var browser_last_refresh = dayjs().add(browserClean, browserCleanUnit);
  var RefreshAvailable = true;
  var ForceRefresh = true;

  while (run) {
    try {
      //Check to refresh the browser -> Based on time and if watching randoms vs high-priority streams
      if ( ForceRefresh || RefreshAvailable && dayjs(browser_last_refresh).isBefore(dayjs())) {
        var newSpawn = await cleanup(browser, page);
        browser = newSpawn.browser;
        page = newSpawn.page;
        firstRun = true;
        PreviousChannelName = null; //Reset the Previous Channel Name to ensure that it will navigate on the next selection
        RefreshAvailable = false;   //After browser has been reset, ignore refreshing until you are sure that it is watching randoms instead of the high priority streams.
        ForceRefresh = false;       //Set the value to false to avoid refreshing it every loop
        browser_last_refresh = dayjs().add(browserClean, browserCleanUnit);
      }

      // Check each stream in the priority list to determine which one to watch
      if ( CheckStreamerOnline(ChannelName_1) ) {         //View First Priority Channel
          var { firstRun } = await ViewURL(page, ChannelName_1, minWatching, firstRun);
      
      } else if ( CheckStreamerOnline(ChannelName_2) ) {  //View Second Priority Channel
          var { firstRun } = await ViewURL(page, ChannelName_2, minWatching, firstRun);

      } else if ( CheckStreamerOnline(ChannelName_3) ) {  //View Third Priority Channel
          var { firstRun } = await ViewURL(page, ChannelName_3, minWatching, firstRun);

      } else if ( IgnoreRandomChannels == TRUE ) { // Don't bother viewing random pages, instead just sit idle until a desired channel comes online
            RefreshAvailable = true ;
            if (firstRun == FALSE ){ 
              ForceRefresh = true; // Force a refresh if no channels available and have not done one yet (Save Resources)
            
            } else {  // Sitting Idle
              var sleep = 2;
              console.log('-- No Stream Available -> Sleeping for ' + sleep + ' minutes\n');
              await page.waitFor(sleep * 60000); //Sleep for X minutes
            }

      } else { // View Random Page & reset the browser if needed
        RefreshAvailable = true;  
        var { firstRun } = await viewRandomPage(page, firstrun);
      }

    } catch (e) {
        console.log('🤬 Error: ', e);
        console.log('Please visit the discord channel to receive help: https://discord.gg/s8AH4aZ');
    }
  }
}


async function ViewURL(page, ChannelURL, SleepTimer, firstRun){
  try {
    
    if ( PreviousChannelName === ChannelURL ) {
      //Page should already be on this channel, so no need to move to it.

    }else {
      console.log('\n🔗 Now watching streamer: ', baseUrl + ChannelURL);
      await page.goto(baseUrl + ChannelURL, {
        "waitUntil": "networkidle0"
      }); //https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#pagegobackoptions
      PreviousChannelName = ChannelURL;  // Store the ChannelURL to avoid refreshing the page if already on this page.
    }

    await clickWhenExist(page, cookiePolicyQuery);  
    await clickWhenExist(page, matureContentQuery); //Click on accept button

    if (firstRun) {
      console.log('🔧 Setting lowest possible resolution..');
      await clickWhenExist(page, streamPauseQuery);

      await clickWhenExist(page, streamSettingsQuery);
      await page.waitFor(streamQualitySettingQuery);

      await clickWhenExist(page, streamQualitySettingQuery);
      await page.waitFor(streamQualityQuery);

      var resolution = await queryOnWebsite(page, streamQualityQuery);
      resolution = resolution[resolution.length - 1].attribs.id;
      await page.evaluate((resolution) => {
        document.getElementById(resolution).click();
      }, resolution);

      await clickWhenExist(page, streamPauseQuery);

      await page.keyboard.press('m'); //For unmute
      var firstRunRet = false;
    }


    if (browserScreenshot) {
      await page.waitFor(1000);
      fs.access(screenshotFolder, error => {
        if (error) {
          fs.promises.mkdir(screenshotFolder);
        }
      });
      await page.screenshot({
        path: `${screenshotFolder}${ChannelURL}.png`
      });
      console.log('📸 Screenshot created: ' + `${ChannelURL}.png`);
    }

    await clickWhenExist(page, sidebarQuery); //Open sidebar
    await page.waitFor(userStatusQuery); //Waiting for sidebar
    let status = await queryOnWebsite(page, userStatusQuery); //status jQuery
    await clickWhenExist(page, sidebarQuery); //Close sidebar

    console.log('💡 Account status:', status[0] ? status[0].children[0].data : "Unknown");
    console.log('🕒 Time: ' + dayjs().format('HH:mm:ss'));
    
    //Sleep Timer
    console.log('💤 Watching stream for ' + SleepTimer + ' minutes\n');
    await SleepWatching(SleepTimer, ChannelURL) //Scan for higher priority channels while watching this stream
    
    return firstRunRet;

  } catch (e) {
    console.log('🤬 Error: ', e);
    console.log('Please visit the discord channel to receive help: https://discord.gg/s8AH4aZ');
  }
}

async function viewRandomPage(page, firstRun) {  
    try {
      //Check to refresh the streamer list
      if (dayjs(streamer_last_refresh).isBefore(dayjs())) {
        await getAllStreamer(page); //Call getAllStreamer function and refresh the list
        streamer_last_refresh = dayjs().add(streamerListRefresh, streamerListRefreshUnit); //https://github.com/D3vl0per/Valorant-watcher/issues/25
      }

      // Pick a stream, get a random sleep timer, and attempt to view the stream
      let watch = streamers[getRandomInt(0, streamers.length - 1)]; //https://github.com/D3vl0per/Valorant-watcher/issues/27
      var SleepTimer = getRandomInt(minWatching, maxWatching); //Set watching timer
      var { firstRunRet } = await ViewURL(page, watch, SleepTimer, firstRun);
      return firstRunRet;

    } catch (e) {
      console.log('🤬 Error: ', e);
      console.log('Please visit the discord channel to receive help: https://discord.gg/s8AH4aZ');
    }
  
}

async function SleepWatching(MaxSleepTimer, ChannelURL) {
  var i = 0;
  var Ch1 = CheckStreamerOnline(ChannelName_1);
  var Ch2 = CheckStreamerOnline(ChannelName_2);
  var Ch3 = CheckStreamerOnline(ChannelName_3);

  do {
    if ( ( ChannelURL ===  ChannelName_2 || ChannelURL === ChannelName_3 ) && Ch1 ) { //Channel 1 is LIVE while viewing Channel 2 / 3
      i = MaxSleepTimer + 1

    } else if ( ChannelURL === ChannelName_3  && Ch2 ) { //Channel 2 is LIVE while viewing Channel 3
      i = MaxSleepTimer + 1

    } else if ( ChannelURL === ChannelName_3 ) {    // Watching Channel 3

    } else if (  Ch1 || Ch2 || Ch3 ) {  //Atleast 1 high priority stream is online -> Set i to the MaxTimer in order to exit the sleep loop
      i = MaxSleepTimer + 1
      
    } else {  // No High Priority streamer is online -> Sleep for 1 minute
      i = i + 1
      await page.waitFor(60000); 
    }    

  } while (i < MaxSleepTimer);
  
}

async function CheckStreamerOnline(ChannelURL) {
  var bolONLINE = false;
  if (ChannelURL ===  'NoValueSet' || ChannelURL ===  '' || ChannelURL ==  null ) {  
      // No Value -> Ignore
      bolOnline = false; 

  } else { //Perform some check to determine if the specic chnannel is online


  }

  return bolONLINE
}

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
    console.log('🔎 Checking config file...');

    if (fs.existsSync(configPath)) {
      console.log('✅ Json config found!');

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
      console.log('❌ No config file found!');

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
    console.log('🤬 Error: ', e);
    console.log('Please visit my discord channel to solve this problem: https://discord.gg/s8AH4aZ');
  }
}



async function spawnBrowser() {
  console.log("=========================");
  console.log('📱 Launching browser...');
  var browser = await puppeteer.launch(browserConfig);
  var page = await browser.newPage();

  console.log('🔧 Setting User-Agent...');
  await page.setUserAgent(userAgent); //Set userAgent

  console.log('🔧 Setting auth token...');
  await page.setCookie(...cookie); //Set cookie

  console.log('⏰ Setting timeouts...');
  await page.setDefaultNavigationTimeout(process.env.timeout || 0);
  await page.setDefaultTimeout(process.env.timeout || 0);

  if (proxyAuth) {
    await page.setExtraHTTPHeaders({
      'Proxy-Authorization': 'Basic ' + Buffer.from(proxyAuth).toString('base64')
    })
  }

  return {
    browser,
    page
  };
}



async function getAllStreamer(page) {
  console.log("=========================");
  await page.goto(streamersUrl, {
    "waitUntil": "networkidle0"
  });
  console.log('🔐 Checking login...');
  await checkLogin(page);
  console.log('📡 Checking active streamers...');
  await scroll(page, scrollTimes);
  const jquery = await queryOnWebsite(page, channelsQuery);
  streamers = null;
  streamers = new Array();

  console.log('🧹 Filtering out html codes...');
  for (var i = 0; i < jquery.length; i++) {
    streamers[i] = jquery[i].attribs.href.split("/")[1];
  }
  return;
}



async function checkLogin(page) {
  let cookieSetByServer = await page.cookies();
  for (var i = 0; i < cookieSetByServer.length; i++) {
    if (cookieSetByServer[i].name == 'twilight-user') {
      console.log('✅ Login successful!');
      return true;
    }
  }
  console.log('🛑 Login failed!');
  console.log('🔑 Invalid token!');
  console.log('\nPleas ensure that you have a valid twitch auth-token.\nhttps://github.com/D3vl0per/Valorant-watcher#how-token-does-it-look-like');
  if (!process.env.token) {
    fs.unlinkSync(configPath);
  }
  process.exit();
}



async function scroll(page, times) {
  console.log('🔨 Emulating scrolling...');

  for (var i = 0; i < times; i++) {
    await page.evaluate(async (page) => {
      var x = document.getElementsByClassName("scrollable-trigger__wrapper");
      x[0].scrollIntoView();
    });
    await page.waitFor(scrollDelay);
  }
  return;
}



function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



async function clickWhenExist(page, query) {
  let result = await queryOnWebsite(page, query);

  try {
    if (result[0].type == 'tag' && result[0].name == 'button') {
      await page.click(query);
      await page.waitFor(500);
      return;
    }
  } catch (e) {}
}



async function queryOnWebsite(page, query) {
  let bodyHTML = await page.evaluate(() => document.body.innerHTML);
  let $ = cheerio.load(bodyHTML);
  const jquery = $(query);
  return jquery;
}



async function cleanup(browser, page) {
  const pages = await browser.pages();
  await pages.map((page) => page.close());
  await treekill(browser.process().pid, 'SIGKILL');
  //await browser.close();
  return await spawnBrowser();
}



async function killBrowser(browser, page) {
  const pages = await browser.pages();
  await pages.map((page) => page.close());
  treekill(browser.process().pid, 'SIGKILL');
  return;
}



async function shutDown() {
  console.log("\n👋Bye Bye👋");
  run = false;
  process.exit();
}


async function main() {
  console.clear();
  console.log("=========================");
  cookie = await readLoginData();
  var {
    browser,
    page
  } = await spawnBrowser();
  await getAllStreamer(page);
  console.log("=========================");
  console.log('🔭 Running watcher...');
  await ViewPriority(browser, page);
};

main();

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
