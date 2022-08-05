const mathjax = require('mathjax-node');

const enSvg = (equationTex) => {
  mathjax.config({ MathJax: {} });
  mathjax.start();
  return mathjax.typeset({ math: equationTex, speakText: false, svg: true })
    .then((resultat) => resultat.svg);
};

const indiceSecurite = () => enSvg(`
  K = 5 \\times \\sum_{Cat.} \\left(
    \\frac{i_c}{I_c}
    \\times \\left( 0.6 + \\frac{r_c}{R_c} \\times 0.4 \\right)
    \\times \\frac{n_c}{N}
  \\right)
`);

module.exports = { indiceSecurite };
