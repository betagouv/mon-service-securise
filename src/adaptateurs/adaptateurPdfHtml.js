const pug = require('pug');

const genereAnnexes = () => Promise.resolve(pug.compileFile('src/pdf/modeles/annexes.pug')());
const genereDossierDecision = () => Promise.resolve(pug.compileFile('src/pdf/modeles/dossierDecision.pug')());

module.exports = { genereAnnexes, genereDossierDecision };
