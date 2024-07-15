const expect = require('expect.js');
const CmsCrisp = require('../../src/cms/cmsCrisp');

describe('Le CMS Crisp', () => {
  it("jette une erreur s'il n'est pas instancié avec le bon adaptateur", () => {
    expect(() => new CmsCrisp({})).to.throwError((e) => {
      expect(e.message).to.be("Impossible d'instancier le CMS sans adaptateur");
    });
  });

  [
    {
      titre: 'Devenir ambassadeur',
      nomMethodeAdaptateur: 'recupereDevenirAmbassadeur',
      nomMethodeCMS: 'recupereDevenirAmbassadeur',
    },
    {
      titre: 'Faire connaître MSS',
      nomMethodeAdaptateur: 'recupereFaireConnaitreMSS',
      nomMethodeCMS: 'recupereFaireConnaitre',
    },
  ].forEach(({ titre, nomMethodeAdaptateur, nomMethodeCMS }) => {
    describe(`sur demande de récupération du contenu de l'article '${titre}'`, () => {
      let adaptateurCmsCrisp;
      let constructeurCrispMarkdown;
      const donneesParDefautAdaptateur = {
        contenuMarkdown: '',
        titre: '',
        description: '',
      };

      beforeEach(() => {
        adaptateurCmsCrisp = {
          recupereDevenirAmbassadeur: async () => donneesParDefautAdaptateur,
          recupereFaireConnaitreMSS: async () => donneesParDefautAdaptateur,
        };
        constructeurCrispMarkdown = () => ({
          versHTML: () => {},
          tableDesMatieres: () => ({}),
        });
      });

      it("utilise l'adaptateur CMS", async () => {
        let adaptateurAppele = false;
        adaptateurCmsCrisp = {
          ...adaptateurCmsCrisp,
          [nomMethodeAdaptateur]: async () => {
            adaptateurAppele = true;
            return donneesParDefautAdaptateur;
          },
        };
        const cmsCrisp = new CmsCrisp({
          adaptateurCmsCrisp,
          constructeurCrispMarkdown,
        });

        await cmsCrisp[nomMethodeCMS]();

        expect(adaptateurAppele).to.be(true);
      });

      it("utilise la fabrique de 'CrispMarkdown' pour transformer le contenu en HTML et générer la table des matières", async () => {
        let contenuParse = false;
        let tdmGeneree = false;
        constructeurCrispMarkdown = () => ({
          versHTML: () => {
            contenuParse = true;
          },
          tableDesMatieres: () => {
            tdmGeneree = true;
          },
        });

        const cmsCrisp = new CmsCrisp({
          adaptateurCmsCrisp,
          constructeurCrispMarkdown,
        });

        await cmsCrisp[nomMethodeCMS]();

        expect(contenuParse).to.be(true);
        expect(tdmGeneree).to.be(true);
      });

      it('retourne le contenu HTML, le titre et la table des matières', async () => {
        adaptateurCmsCrisp = {
          ...adaptateurCmsCrisp,
          [nomMethodeAdaptateur]: async () => ({
            contenuMarkdown: 'Un contenu',
            titre: 'Un titre',
            description: 'Une description',
          }),
        };
        constructeurCrispMarkdown = (chaine) => ({
          versHTML: () => `HTML ${chaine}`,
          tableDesMatieres: () => ['1', '2'],
        });

        const cmsCrisp = new CmsCrisp({
          adaptateurCmsCrisp,
          constructeurCrispMarkdown,
        });

        const resultat = await cmsCrisp[nomMethodeCMS]();

        expect(resultat).to.eql({
          titre: 'Un titre',
          contenu: 'HTML Un contenu',
          description: 'Une description',
          tableDesMatieres: ['1', '2'],
        });
      });
    });
  });
});
