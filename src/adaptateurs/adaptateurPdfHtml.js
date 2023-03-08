const pug = require('pug');

const genereAnnexes = ({
  donneesDescription,
  donneesMesures,
  donneesRisques,
  referentiel,
  nonce,
}) => (
  Promise.resolve(pug.compileFile('src/pdf/modeles/annexes.pug')({ donneesDescription, donneesMesures, donneesRisques, referentiel, nonce }))
);
const genereDossierDecision = () => Promise.resolve(pug.compileFile('src/pdf/modeles/dossierDecision.pug')());

module.exports = { genereAnnexes, genereDossierDecision };
