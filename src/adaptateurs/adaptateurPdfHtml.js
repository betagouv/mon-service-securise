const pug = require('pug');

const genereAnnexes = ({ donneesDescription, nonce }) => Promise.resolve(pug.compileFile('src/pdf/modeles/annexeDescription.pug')({ donnees: donneesDescription, nonce }));
const genereDossierDecision = () => Promise.resolve(pug.compileFile('src/pdf/modeles/dossierDecision.pug')());

module.exports = { genereAnnexes, genereDossierDecision };
