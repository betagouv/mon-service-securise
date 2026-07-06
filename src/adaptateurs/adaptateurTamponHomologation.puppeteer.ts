import puppeteer from 'puppeteer';

const generationPdfExterne = () => {
  const { GENERATION_PDF_URL_DU_SERVICE, GENERATION_PDF_TOKEN_DU_SERVICE } =
    process.env;

  return {
    verifieConfiguration: () => {
      const urlEstDefinie = !!GENERATION_PDF_URL_DU_SERVICE;
      const tokenEstDefini = !!GENERATION_PDF_TOKEN_DU_SERVICE;
      if (!urlEstDefinie || !tokenEstDefini)
        throw new Error(
          "La génération externe de PDF est activée. Mais il manque la configuration de l'URL et du token."
        );
    },
    endpointWebsocket: () =>
      `${GENERATION_PDF_URL_DU_SERVICE}?token=${GENERATION_PDF_TOKEN_DU_SERVICE}`,
  };
};

const lanceNavigateur = async () => {
  generationPdfExterne().verifieConfiguration();

  return puppeteer.connect({
    browserWSEndpoint: generationPdfExterne().endpointWebsocket(),
  });
};

export { lanceNavigateur };
