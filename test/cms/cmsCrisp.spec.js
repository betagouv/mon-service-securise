const expect = require('expect.js');
const CmsCrisp = require('../../src/cms/cmsCrisp');
const { ErreurArticleCrispIntrouvable } = require('../../src/erreurs');

describe('Le CMS Crisp', () => {
  const donneesParDefautAdaptateur = {
    contenuMarkdown: '',
    titre: '',
    description: '',
  };

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
    {
      titre: 'Promouvoir MSS',
      nomMethodeAdaptateur: 'recuperePromouvoir',
      nomMethodeCMS: 'recuperePromouvoir',
    },
    {
      titre: 'Roadmap MSS',
      nomMethodeAdaptateur: 'recupereRoadmap',
      nomMethodeCMS: 'recupereRoadmap',
    },
  ].forEach(({ titre, nomMethodeAdaptateur, nomMethodeCMS }) => {
    describe(`sur demande de récupération du contenu de l'article '${titre}'`, () => {
      let adaptateurCmsCrisp;
      let constructeurCrispMarkdown;

      beforeEach(() => {
        adaptateurCmsCrisp = {
          recupereDevenirAmbassadeur: async () => donneesParDefautAdaptateur,
          recupereFaireConnaitreMSS: async () => donneesParDefautAdaptateur,
          recuperePromouvoir: async () => donneesParDefautAdaptateur,
          recupereRoadmap: async () => donneesParDefautAdaptateur,
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

  describe("sur demande d'un article de la catégorie `blog`", () => {
    let adaptateurCmsCrisp;
    let cmsCrisp;
    let constructeurCrispMarkdown;
    beforeEach(() => {
      adaptateurCmsCrisp = {
        recupereArticlesBlog: async () => {},
      };
      constructeurCrispMarkdown = () => ({
        versHTML: () => {},
        tableDesMatieres: () => ({}),
      });
      cmsCrisp = new CmsCrisp({
        adaptateurCmsCrisp,
        constructeurCrispMarkdown,
      });
    });

    it("retourne une erreur spécifique si l'appel API échoue", async () => {
      adaptateurCmsCrisp.recupereArticlesBlog = async () => {
        throw new Error('une erreur API');
      };

      try {
        await cmsCrisp.recupereArticleBlog('un-slug');
      } catch (e) {
        expect(e).to.be.an(ErreurArticleCrispIntrouvable);
      }
    });

    it("récupère l'article selon son slug", async () => {
      adaptateurCmsCrisp.recupereArticlesBlog = async () => [
        {
          id: '1',
          url: 'http://localhost://crisp/article/un-slug-1ab2c3/',
          section: {
            id: 'id_1',
            nom: 'uneSection',
          },
        },
        {
          id: '2',
          url: 'http://localhost://crisp/article/un-autre-slug-1ab2c4/',
          section: {
            id: 'id_2',
            nom: 'uneAutreSection',
          },
        },
      ];
      let idPasse;
      adaptateurCmsCrisp.recupereArticle = async (idArticle) => {
        idPasse = idArticle;
        return donneesParDefautAdaptateur;
      };

      await cmsCrisp.recupereArticleBlog('un-slug');

      expect(idPasse).to.be('1');
    });

    it('retourne une erreur si aucun article ne correspond au slug', async () => {
      adaptateurCmsCrisp.recupereArticlesBlog = async () => [
        {
          id: '1',
          url: 'http://localhost://crisp/article/un-slug-1ab2c3/',
        },
      ];

      try {
        await cmsCrisp.recupereArticleBlog('un-slug-introuvable');
      } catch (e) {
        expect(e).to.be.an(ErreurArticleCrispIntrouvable);
      }
    });

    it("retourne tout le contenu de l'article, en ajoutant les données de section", async () => {
      adaptateurCmsCrisp.recupereArticle = async () => ({
        contenuMarkdown: 'Un contenu',
        titre: 'Un titre',
        description: 'Une description',
      });
      adaptateurCmsCrisp.recupereArticlesBlog = async () => [
        {
          id: '1',
          url: 'http://localhost://crisp/article/un-slug-1ab2c3/',
          section: {
            id: 'id_1',
            nom: 'uneSection',
          },
        },
      ];
      constructeurCrispMarkdown = (chaine) => ({
        versHTML: () => `HTML ${chaine}`,
        tableDesMatieres: () => ['1', '2'],
      });
      cmsCrisp = new CmsCrisp({
        adaptateurCmsCrisp,
        constructeurCrispMarkdown,
      });

      const resultat = await cmsCrisp.recupereArticleBlog('un-slug');

      expect(resultat).to.eql({
        titre: 'Un titre',
        contenu: 'HTML Un contenu',
        description: 'Une description',
        tableDesMatieres: ['1', '2'],
        section: {
          id: 'id_1',
          nom: 'uneSection',
        },
      });
    });
  });

  describe('sur demande des sections de la catégorie `blog`', () => {
    it("délègue à l'adaptateur la récupération des sections", async () => {
      const adaptateurCmsCrisp = {
        recupereSectionsBlog: async () => [{ id: 1, nom: 'uneSection' }],
      };
      const cmsCrisp = new CmsCrisp({
        adaptateurCmsCrisp,
      });

      const sections = await cmsCrisp.recupereSectionsBlog();

      expect(sections).to.eql([{ id: 1, nom: 'uneSection' }]);
    });
  });

  describe('sur demande des articles de la catégorie `blog`', () => {
    it("délègue à l'adaptateur la récupération des articles et met en forme l'url", async () => {
      const adaptateurCmsCrisp = {
        recupereArticlesBlog: async () => [
          {
            id: 1,
            titre: 'unArticle',
            url: 'http://localhost/article/un-slug-abc123/',
            section: {
              id: 'A',
              nom: 'uneSection',
            },
          },
        ],
      };
      const cmsCrisp = new CmsCrisp({
        adaptateurCmsCrisp,
      });

      const articles = await cmsCrisp.recupereArticlesBlog();

      expect(articles).to.eql([
        {
          id: 1,
          titre: 'unArticle',
          url: '/articles/un-slug',
          section: {
            id: 'A',
            nom: 'uneSection',
          },
        },
      ]);
    });

    it("reste robuste si l'url n'est pas définie", async () => {
      const adaptateurCmsCrisp = {
        recupereArticlesBlog: async () => [
          {
            url: '',
          },
        ],
      };
      const cmsCrisp = new CmsCrisp({
        adaptateurCmsCrisp,
      });

      const articles = await cmsCrisp.recupereArticlesBlog();

      expect(articles[0].url).to.be(null);
    });
  });
});
