const puppeteer = require('puppeteer');

const lanceNavigateur = async () => puppeteer.launch({ headless: true,
  // Documentation des arguments : https://peter.sh/experiments/chromium-command-line-switches/
  // Inspiration pour la liste utilisée ici : https://www.bannerbear.com/blog/ways-to-speed-up-puppeteer-screenshots/
  // Le but est d'avoir un Puppeteer le plus léger et rapide à lancer possible.
  args: [
    '--no-sandbox',
    '--font-render-hinting=none',
    '--disable-gpu',
    '--autoplay-policy=user-gesture-required',
    '--disable-accelerated-2d-canvas',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-zygote',
    '--password-store=basic',
    '--single-process',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
  ] });

module.exports = { lanceNavigateur };
