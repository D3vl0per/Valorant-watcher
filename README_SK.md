


<h1 align="center">Valorant watcher</h1>
<p align="center"> Strávil som dve dni sledovaním Valorant streamov. Prestalo ma to baviť...</p>
<p align="center">
<img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/D3vl0per/Valorant-watcher"> <img alt="GitHub" src="https://img.shields.io/github/repo-size/D3vl0per/Valorant-watcher"> <img alt="GitHub repo size" src="https://img.shields.io/github/license/D3vl0per/Valorant-watcher"> <img alt="GitHub issues" src="https://img.shields.io/github/issues/D3vl0per/Valorant-watcher"> <a href="https://asciinema.org/a/rob4Rh1EG4XFVfN4XWK67JSnf" target="_blank"><img src="https://asciinema.org/a/rob4Rh1EG4XFVfN4XWK67JSnf.svg" /></a>
</p>

## Features
- 🎥 Skutočné HTTP live video streamovanie (Zabudnite na #4000 error kód.)
- 🔐 Bezpečné prihlasovanie s cookies.
- 📜 Automatické akceptovanie Privacy Policy.
- 👨‍💻 Výber random streamera s drop-enabled tagom.
- 🤐 Nestíšený stream.
- 🛠 Rozpoznávanie mature-content streamera a automatické potvrdenie.
- 🛡 Možnosť použitia proxy.
- 📽 Automaticky najnižšie rozlíšenie pre najmenší dopad na výkon.
- 🧰 Ľahko-upravovateľný kód.
- 📦 Možnosť deploynutia pomocou Dockera.
- 🏳️ Nápomocná komunita.
- 💬 Čítajma vo viacerých jazykoch: [🇫🇷 README](https://github.com/D3vl0per/Valorant-watcher/blob/languages/README_FR.md) [🇧🇷 README](https://github.com/D3vl0per/Valorant-watcher/blob/languages/README_PT.md) [🇷🇺 README](https://github.com/D3vl0per/Valorant-watcher/blob/languages/README_RU.md) [ꜱᴋ README](https://github.com/D3vl0per/Valorant-watcher/blob/languages/README_SK.md)

## Požiadavky

 - Windows alebo Linux OS
 - Internetové pripojenie (samozrejme...)
 - [Nodejs](https://nodejs.org/en/download/) a [NPM](https://www.npmjs.com/get-npm)
 
## Inštalácia
🎥 [Video tutoriál od Ziyad](https://youtu.be/bwzv7wT44Ds) 🎥
### Windows
1. Prihlás sa do twitch.tv
2. Klikni pravým a vyber Preskúmať (F12 alebo Ctrl+Shift+I) na hlavnej stránke (twitch.tv)
3. Nájdi uložené cookies.
4. Skopiruj **auth-token**
5. Naklonuj tento repozitár
6. Nainštaluj Chromium.
7. Väčšinou cesta k Chrome.exe je : C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe
8. Nainštaluj nároky(dependencies) pomocou `npm install`
9. Spusti program pomocou `npm start`
### Linux
1. Prihlás sa do twitch.tv
2. Klikni pravým a vyber Preskúmať (F12 alebo Ctrl+Shift+I) na hlavnej stránke (twitch.tv)
3. Nájdi uložené cookies.
4. Skopiruj **auth-token**
5. Naklonuj tento repozitár
6. Nainštaluj Chromium: [TUTORIÁL 🤗](https://www.addictivetips.com/ubuntu-linux-tips/install-chromium-on-linux/)
7. Nájdi Chromium : `whereis chromium`
8. Nainštaluj nároky(dependencies) pomocou `npm install`
9. Spusti program pomocou `npm start`

## Docker
<p align="center">
<img alt="Docker Image Version (latest by date)" src="https://img.shields.io/docker/v/d3vm/valorant-watcher"> <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/d3vm/valorant-watcher"> <img alt="Docker Image Size (latest by date)" src="https://img.shields.io/docker/image-size/d3vm/valorant-watcher">
</p>


>Docker je v informatike názov pre otvorený softvér (open source projekt), ktorého cieľom je poskytnúť jednotné rozhranie pre izoláciu aplikácií do kontajnerov v prostredí Linuxu i Windows ("odľahčená virtualizácia").
### Požiadavky
- [Docker](https://docs.docker.com/get-docker/)
- [Docker-Compose](https://docs.docker.com/compose/install/)

### Použitie
1. Stiahnite docker-compose-example.yml
2. Premenujte docker-compose.yml
3. Otvor a nahraď **token** v docker-compose.yml
4. Spusti pomocou príkazu `docker-compose up -d`
## Nároky (dependencies)
<p align="center">
<img alt="GitHub package.json dependency version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/dependency-version/D3vl0per/Valorant-watcher/puppeteer-core"> <img alt="GitHub package.json dependency version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/dependency-version/D3vl0per/Valorant-watcher/cheerio"> <img alt="GitHub package.json dependency version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/dependency-version/D3vl0per/Valorant-watcher/inquirer"> <img alt="GitHub package.json dependency version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/dependency-version/D3vl0per/Valorant-watcher/dotenv"> <img alt="GitHub package.json dependency version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/dependency-version/D3vl0per/Valorant-watcher/dayjs"> <img alt="GitHub package.json dependency version (prod)" src="https://img.shields.io/github/package-json/dependency-version/D3vl0per/valorant-watcher/tree-kill">
</p>

## Riešenie problémov

### Ako vyzerá token?
auth-token: `rxk38rh5qtyw95fkvm7kgfceh4mh6u`
___


### Streamers.json je prázdny?

Skúste znova s väčším oneskorením.
Predvolené oneskorenie:
```javascript
const scrollDelay = 2000;
```
[Ísť na miesto v kóde](https://github.com/D3vl0per/Valorant-watcher/blob/12dce8065423861971b7088563ad936b2dcc2559/app.js#L15)
___
### Something went wrong?
Skúste non-headless mód. Nastavte headless hodnotu na `true`, takto:
```javascript
const showBrowser = true;
```
[Ísť na miesto v kóde](https://github.com/D3vl0per/Valorant-watcher/blob/12dce8065423861971b7088563ad936b2dcc2559/app.js#L24)
___
### Proxy?

Samozrejme:
```javascript
const proxy = ""; // "ip:port" By https://github.com/Jan710
```
[Ísť na miesto v kóde](https://github.com/D3vl0per/Valorant-watcher/blob/12dce8065423861971b7088563ad936b2dcc2559/app.js#L25)  

ALEBO

S Docker env:
```
proxy=PROXY_IP_ADDRESS:PROXY_PORT
```
___
### Snímka obrazovky bez headless módu.
```javascript
const browserScreenshot = false;
```
[Ísť na miesto v kóde](https://github.com/D3vl0per/Valorant-watcher/blob/12dce8065423861971b7088563ad936b2dcc2559/app.js#L27)

## Donate-y
Prosím podporte finančne tento projekt pre jeho udržiavanie.

Hlavne tí, ktorí farmia dropy a predávajú účty!🤓  

<a href="https://www.buymeacoffee.com/D3v" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>


## Podpora
 - Keybase - [https://keybase.io/d3v_](https://keybase.io/d3v_)
 - Discord - [https://discord.gg/s8AH4aZ](https://discord.gg/s8AH4aZ)

## Vylúčenie zodpovednosti
Tento kód je len pre edukačné účely.
Neskúšajte porušit zákony s týmto kódom.
Nebudem zodpovedný za žiadne nelegalné úkony.
Reprodukcia a šírenie je povolené v prípade, že je autor oboznámený.
