const pug = require('pug');

const genereAnnexes = ({ donneesDescription, donneesMesures, nonce }) => (
  Promise.resolve(pug.compileFile('src/pdf/modeles/annexes.pug')({ donneesDescription, donneesMesures, nonce }))
);
const genereDossierDecision = () => Promise.resolve(pug.compileFile('src/pdf/modeles/dossierDecision.pug')());

module.exports = { genereAnnexes, genereDossierDecision };
