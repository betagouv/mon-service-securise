const expect = require('expect.js');
const CrispMarkdown = require('../../src/cms/crispMarkdown');

describe('Le convertisseur de Markdown Crisp', () => {
  it('sait parser une "boite" de niveau "aide"', () => {
    const entree = '| Une aide.\n';
    const crispMarkdown = new CrispMarkdown(entree);

    const resultat = crispMarkdown.versHTML();

    expect(resultat).to.be("<div class='aide'>Une aide.</div>");
  });

  it('sait parser une "boite" de niveau "information"', () => {
    const entree = '|| Une information.\n';
    const crispMarkdown = new CrispMarkdown(entree);

    const resultat = crispMarkdown.versHTML();

    expect(resultat).to.be("<div class='information'>Une information.</div>");
  });

  it('sait parser une "boite" de niveau "alerte"', () => {
    const entree = '||| Une alerte.\n';
    const crispMarkdown = new CrispMarkdown(entree);

    const resultat = crispMarkdown.versHTML();

    expect(resultat).to.be("<div class='alerte'>Une alerte.</div>");
  });

  it('sait parser une vidéo avec une légende', () => {
    // eslint-disable-next-line no-template-curly-in-string
    const entree = '${frame}[LEGENDE](http://url.video)\n';
    const crispMarkdown = new CrispMarkdown(entree);

    const resultat = crispMarkdown.versHTML();

    expect(resultat).to.be(
      "<div class='conteneur-video'>" +
        "<video src='http://url.video' controls />" +
        "<p class='legende'>LEGENDE</p>" +
        '</div>'
    );
  });
});
