


<h1 align="center">Valorant watcher</h1>
<p align="center"> I spent two days watching Valorant streams to get a drop. I got bored...</p>
<p align="center">
<img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/D3vl0per/Valorant-watcher"> <img alt="GitHub" src="https://img.shields.io/github/repo-size/D3vl0per/Valorant-watcher"> <img alt="GitHub repo size" src="https://img.shields.io/github/license/D3vl0per/Valorant-watcher"> <img alt="GitHub issues" src="https://img.shields.io/github/issues/D3vl0per/Valorant-watcher"> <a href="https://asciinema.org/a/rob4Rh1EG4XFVfN4XWK67JSnf" target="_blank"><img src="https://asciinema.org/a/rob4Rh1EG4XFVfN4XWK67JSnf.svg" /></a>
</p>



## Requirements

 - Windows or Linux OS
 - Network connection (So obvious...)
 - [Nodejs](https://nodejs.org/en/download/) and [NPM](https://www.npmjs.com/get-npm)

## Features
- 🎥 True HTTP Live Streaming support (Forget the #4000 error code)
- 🔐 Cookie based login
- 📜 Auto accept cookie policy
- 👨‍💻 Choice random streamer with drop-enabled tag
- 🤐 Unmute stream
- 🛠 Detect mature content based stream and interact it
- 🛡 Proxy option
- 📽 Auto lowest possible resolution settings
- 🧰 Highly customizable codebase
- 📦 Deployable to VPS by docker
- 🏳️ Helpful support community


## Installation

### Windows
1. Login your twitch account
2. Open inspector(F12 or Ctlr+Shift+I) on main site
3. Find stored cookie section
4. Copy **auth-token**
5. Clone this repo
6. Install chromium
7. Usualy path to chromium executable: C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe
8. Install the dependencies with `npm install`
9. Start the program with `npm start`
### Linux
1. Login your twitch account
2. Open inspector(F12 or Ctlr+Shift+I) on main site
3. Find stored cookie section
4. Copy **auth-token**
5. Clone this repo
6. Install chromium: [TUTORIAL 🤗](https://www.addictivetips.com/ubuntu-linux-tips/install-chromium-on-linux/)
7. Locate chromium executable: `whereis chromium`
8. Install the dependencies with `npm install`
9. Start the program with `npm start`

## Docker
<p align="center">
<img alt="Docker Image Version (latest by date)" src="https://img.shields.io/docker/v/d3vm/valorant-watcher"> <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/d3vm/valorant-watcher"> <img alt="Docker Image Size (latest by date)" src="https://img.shields.io/docker/image-size/d3vm/valorant-watcher">
</p>


>Docker is a set of platform as a service (PaaS) products that uses OS-level virtualization to deliver software in packages called containers. Containers are isolated from one another and bundle their own software, libraries and configuration files. All containers are run by a single operating system kernel and therefore use fewer resources than virtual machines.
### Requirements
- [Docker](https://docs.docker.com/get-docker/)
- [Docker compose](https://docs.docker.com/compose/install/)

### Useage
1. Download docker-compose-example.yml
2. Rename docker-compose.yml
3. Open and replace the **token** environment record
4. Run with `docker-compose up -d` command
## Dependencies
<p align="center">
<img alt="GitHub package.json dependency version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/dependency-version/D3vl0per/Valorant-watcher/puppeteer-core"> <img alt="GitHub package.json dependency version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/dependency-version/D3vl0per/Valorant-watcher/cheerio"> <img alt="GitHub package.json dependency version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/dependency-version/D3vl0per/Valorant-watcher/inquirer"> <img alt="GitHub package.json dependency version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/dependency-version/D3vl0per/Valorant-watcher/dotenv"> <img alt="GitHub package.json dependency version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/dependency-version/D3vl0per/Valorant-watcher/dayjs"> <img alt="GitHub package.json dependency version (prod)" src="https://img.shields.io/github/package-json/dependency-version/d3vm/valorant-watcher/tree-kill">
</p>

## Troubleshooting

### How token does it look like?
auth-token: `rxk38rh5qtyw95fkvm7kgfceh4mh6u`
___


### streamers.json is empty?

Try to again with higher delay.
Default delay:
```javascript
const scrollDelay = 2000;
```
[Go to code](https://github.com/D3vl0per/Valorant-watcher/blob/12dce8065423861971b7088563ad936b2dcc2559/app.js#L15)
___
### Something went wrong?
Try to non-headless mode. Edit headless value to `true`, like this:
```javascript
const showBrowser = true;
```
[Go to code](https://github.com/D3vl0per/Valorant-watcher/blob/12dce8065423861971b7088563ad936b2dcc2559/app.js#L24)
___
### Proxy?

Yes, of course:
```javascript
const proxy = ""; // "ip:port" By https://github.com/Jan710
```
[Go to code](https://github.com/D3vl0per/Valorant-watcher/blob/12dce8065423861971b7088563ad936b2dcc2559/app.js#L25)  

OR

With Docker env:
```
proxy=PROXY_IP_ADDRESS:PROXY_PORT
```
___
### Screenshot without non-headless mode
```javascript
const browserScreenshot = false;
```
[Go to code](https://github.com/D3vl0per/Valorant-watcher/blob/12dce8065423861971b7088563ad936b2dcc2559/app.js#L27)

## Donation
Please donate to keep alive this project!

Especially the drop farmers who gather tons of money with this software!🤓  

<style>.bmc-button img{height: 34px !important;width: 35px !important;margin-bottom: 1px !important;box-shadow: none !important;border: none !important;vertical-align: middle !important;}.bmc-button{padding: 7px 10px 7px 10px !important;line-height: 35px !important;height:51px !important;min-width:217px !important;text-decoration: none !important;display:inline-flex !important;color:#FFFFFF !important;background-color:#FF813F !important;border-radius: 5px !important;border: 1px solid transparent !important;padding: 7px 10px 7px 10px !important;font-size: 22px !important;letter-spacing: 0.6px !important;box-shadow: 0px 1px 2px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;margin: 0 auto !important;font-family:'Cookie', cursive !important;-webkit-box-sizing: border-box !important;box-sizing: border-box !important;-o-transition: 0.3s all linear !important;-webkit-transition: 0.3s all linear !important;-moz-transition: 0.3s all linear !important;-ms-transition: 0.3s all linear !important;transition: 0.3s all linear !important;}.bmc-button:hover, .bmc-button:active, .bmc-button:focus {-webkit-box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;text-decoration: none !important;box-shadow: 0px 1px 2px 2px rgba(190, 190, 190, 0.5) !important;opacity: 0.85 !important;color:#FFFFFF !important;}</style><link href="https://fonts.googleapis.com/css?family=Cookie" rel="stylesheet"><a class="bmc-button" target="_blank" href="https://www.buymeacoffee.com/D3v"><img src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg" alt="Buy me a coffee"><span style="margin-left:15px;font-size:28px !important;">Buy me a coffee</span></a>


## Support
 - Keybase at [https://keybase.io/d3v_](https://keybase.io/d3v_)
 - Discord at [https://discord.gg/s8AH4aZ](https://discord.gg/s8AH4aZ)

## Disclaimer
These codes for educational and research purposes only.  
Do not attempt to violate the law with anything contained here.  
I will not be responsible for your any illegal actions.  
Reproduction and copy is authorised, provided the source is acknowledged.
