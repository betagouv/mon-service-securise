const puppeteer = require('puppeteer');

const generationPdfExterne = () => {
  const {
    GENERATION_PDF_URL_DU_SERVICE,
    GENERATION_PDF_TOKEN_DU_SERVICE,
    AVEC_GENERATION_PDF_EXTERNE,
  } = process.env;

  return {
    activee: () => {
      const activee = AVEC_GENERATION_PDF_EXTERNE === 'true';

      if (!activee) return false;

      const urlEstDefinie = !!GENERATION_PDF_URL_DU_SERVICE;
      const tokenEstDefini = !!GENERATION_PDF_TOKEN_DU_SERVICE;
      if (!urlEstDefinie || !tokenEstDefini)
        throw new Error(
          "La génération externe de PDF est activée. Mais il manque la configuration de l'URL et du token."
        );

      return true;
    },
    endpointWebsocket: () =>
      `${GENERATION_PDF_URL_DU_SERVICE}?token=${GENERATION_PDF_TOKEN_DU_SERVICE}`,
  };
};

const lanceNavigateur = async () => {
  if (generationPdfExterne().activee())
    return puppeteer.connect({
      browserWSEndpoint: generationPdfExterne().endpointWebsocket(),
    });

  return puppeteer.launch({
    headless: true,
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
    ],
  });
};

module.exports = { lanceNavigateur };
