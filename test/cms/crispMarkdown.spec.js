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
        "<video src='http://url.video' controls></video>" +
        "<p class='legende'>LEGENDE</p>" +
        '</div>'
    );
  });

  describe('concernant les titres', () => {
    it("diminue d'un niveau la hierarchie des titres afin de réserver le h1 pour le titre de la page", () => {
      const entree = '# Un titre';
      const crispMarkdown = new CrispMarkdown(entree);

      const resultat = crispMarkdown.versHTML();

      expect(resultat).to.be("<h2 id='un-titre'>Un titre</h2>");
    });

    it('contrains les niveaux de hierarchie entre 2 et 4', () => {
      const entree = '# Un titre\n###### Un autre titre';
      const crispMarkdown = new CrispMarkdown(entree);

      const resultat = crispMarkdown.versHTML();

      expect(resultat).to.be(
        "<h2 id='un-titre'>Un titre</h2><h4 id='un-autre-titre'>Un autre titre</h4>"
      );
    });

    it('ajoute un slug sur le titre', () => {
      const entree = '# Un titre';
      const crispMarkdown = new CrispMarkdown(entree);

      const resultat = crispMarkdown.versHTML();

      expect(resultat).to.be("<h2 id='un-titre'>Un titre</h2>");
    });
  });

  describe('concernant les liens', () => {
    it('ajoute une cible et une classe "telechargement" si le lien comporte le texte "Télécharger"', () => {
      const entree = '[Télécharger un document](http://url.video)';
      const crispMarkdown = new CrispMarkdown(entree);

      const resultat = crispMarkdown.versHTML();

      expect(resultat).to.be(
        "<p><a href='http://url.video' class='telechargement' target='_blank' rel='noreferrer nofollow'>Télécharger un document</a></p>\n"
      );
    });

    it('reste robuste pour les autres types de lien', () => {
      const entree = '[Un lien](http://url.video)';
      const crispMarkdown = new CrispMarkdown(entree);

      const resultat = crispMarkdown.versHTML();

      expect(resultat).to.be("<p><a href='http://url.video'>Un lien</a></p>\n");
    });
  });
});
