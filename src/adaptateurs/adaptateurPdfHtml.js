const pug = require('pug');

const genereAnnexes = ({ donneesDescription }) => Promise.resolve(pug.compileFile('src/pdf/modeles/annexes.pug')({ donnees: donneesDescription }));
const genereDossierDecision = () => Promise.resolve(pug.compileFile('src/pdf/modeles/dossierDecision.pug')());

module.exports = { genereAnnexes, genereDossierDecision };
