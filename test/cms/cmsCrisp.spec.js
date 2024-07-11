const expect = require('expect.js');
const CmsCrisp = require('../../src/cms/cmsCrisp');

describe('Le CMS Crisp', () => {
  it("jette une erreur s'il n'est pas instancié avec le bon adaptateur", () => {
    expect(() => new CmsCrisp({})).to.throwError((e) => {
      expect(e.message).to.be("Impossible d'instancier le CMS sans adaptateur");
    });
  });

  describe("sur demande de récupération du contenu de l'article 'Devenir ambassadeur'", () => {
    let adaptateurCmsCrisp;
    let constructeurCrispMarkdown;

    beforeEach(() => {
      adaptateurCmsCrisp = {
        recupereDevenirAmbassadeur: async () => ({
          contenuMarkdown: '',
          titre: '',
        }),
      };
      constructeurCrispMarkdown = () => ({
        versHTML: () => {},
      });
    });

    it("utilise l'adaptateur CMS", async () => {
      let adaptateurAppele = false;
      adaptateurCmsCrisp = {
        recupereDevenirAmbassadeur: async () => {
          adaptateurAppele = true;
          return { contenuMarkdown: '', titre: '' };
        },
      };
      const cmsCrisp = new CmsCrisp({
        adaptateurCmsCrisp,
        constructeurCrispMarkdown,
      });

      await cmsCrisp.recupereDevenirAmbassadeur();

      expect(adaptateurAppele).to.be(true);
    });

    it("utilise la fabrique de 'CrispMarkdown' pour transformer le contenu en HTML", async () => {
      let crispMarkdownAppele = false;
      constructeurCrispMarkdown = () => ({
        versHTML: () => {
          crispMarkdownAppele = true;
        },
      });

      const cmsCrisp = new CmsCrisp({
        adaptateurCmsCrisp,
        constructeurCrispMarkdown,
      });

      await cmsCrisp.recupereDevenirAmbassadeur();

      expect(crispMarkdownAppele).to.be(true);
    });

    it('retourne le contenu HTML ainsi que le titre', async () => {
      adaptateurCmsCrisp = {
        recupereDevenirAmbassadeur: async () => ({
          contenuMarkdown: 'Un contenu',
          titre: 'Un titre',
        }),
      };
      constructeurCrispMarkdown = (chaine) => ({
        versHTML: () => `HTML ${chaine}`,
      });

      const cmsCrisp = new CmsCrisp({
        adaptateurCmsCrisp,
        constructeurCrispMarkdown,
      });

      const resultat = await cmsCrisp.recupereDevenirAmbassadeur();

      expect(resultat).to.eql({
        titre: 'Un titre',
        contenu: 'HTML Un contenu',
      });
    });
  });
});
