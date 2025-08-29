import expect from 'expect.js';
import CmsCrisp from '../../src/cms/cmsCrisp.js';

describe('Le CMS Crisp', () => {
  let adaptateurEnvironnement;

  beforeEach(() => {
    adaptateurEnvironnement = {
      crisp: () => ({
        idSite: () => 'id-site',
        cleApi: () => 'cle',
        idCategorieBlog: () => 'id-blog',
      }),
    };
  });

  describe("sur demande d'un article de la catégorie `blog`", () => {
    it("utilise le cms crisp pour récupérer l'article", async () => {
      const cmsCrisp = new CmsCrisp({ adaptateurEnvironnement });
      let slugUtilise;
      let idCategorieUtilise;

      cmsCrisp.recupereArticleCategorie = async (slug, idCategorie) => {
        slugUtilise = slug;
        idCategorieUtilise = idCategorie;
        return 'article-avec-slug';
      };

      const article = await cmsCrisp.recupereArticleBlog('un-slug');

      expect(slugUtilise).to.be('un-slug');
      expect(idCategorieUtilise).to.be('id-blog');
      expect(article).to.be('article-avec-slug');
    });
  });

  describe('sur demande des sections de la catégorie `blog`', () => {
    it('utilise le cms crisp pour récupérer les sections', async () => {
      const cmsCrisp = new CmsCrisp({ adaptateurEnvironnement });
      let idCategorieUtilise;

      cmsCrisp.recupereSectionsCategorie = async (idCategorie) => {
        idCategorieUtilise = idCategorie;
        return 'sections';
      };

      const sections = await cmsCrisp.recupereSectionsBlog();

      expect(idCategorieUtilise).to.be('id-blog');
      expect(sections).to.be('sections');
    });
  });

  describe('sur demande des articles de la catégorie `blog`', () => {
    it('utilise le cms crisp pour récupérer les articles', async () => {
      const cmsCrisp = new CmsCrisp({ adaptateurEnvironnement });
      let idCategorieUtilise;

      cmsCrisp.recupereArticlesCategorie = async (idCategorie) => {
        idCategorieUtilise = idCategorie;
        return 'articles-de-la-categorie';
      };

      const articles = await cmsCrisp.recupereArticlesBlog();

      expect(idCategorieUtilise).to.be('id-blog');
      expect(articles).to.be('articles-de-la-categorie');
    });
  });

  describe("sur demande d'un article statique", () => {
    [
      {
        titre: 'Devenir ambassadeur',
        nomMethodeCMS: 'recupereDevenirAmbassadeur',
        nomMethodeAdaptateurEnvironnement: 'idArticleDevenirAmbassadeur',
        idArticle: 'devenir-ambassadeur',
      },
      {
        titre: 'Faire connaître MSS',
        nomMethodeCMS: 'recupereFaireConnaitre',
        nomMethodeAdaptateurEnvironnement: 'idArticleFaireConnaitre',
        idArticle: 'faire-connaitre',
      },
      {
        titre: 'Roadmap MSS',
        nomMethodeCMS: 'recupereRoadmap',
        nomMethodeAdaptateurEnvironnement: 'idArticleRoadmap',
        idArticle: 'roadmap',
      },
    ].forEach(
      ({
        titre,
        nomMethodeCMS,
        nomMethodeAdaptateurEnvironnement,
        idArticle,
      }) => {
        it(`utilise le cms crisp pour récupérer l'article ${titre}`, async () => {
          const adaptateurEnvironnementAvecIdArticle = {
            crisp: () => ({
              idSite: () => 'id-site',
              cleApi: () => 'cle',
              [nomMethodeAdaptateurEnvironnement]: () => idArticle,
            }),
          };
          const cmsCrisp = new CmsCrisp({
            adaptateurEnvironnement: adaptateurEnvironnementAvecIdArticle,
          });
          let idArticleRecu;
          cmsCrisp.adaptateurCmsCrisp.recupereArticle = async (
            idArticleRecupere
          ) => {
            idArticleRecu = idArticleRecupere;
            return {
              contenuMarkdown: '',
              titre: '',
              description: '',
            };
          };

          await cmsCrisp[nomMethodeCMS]();

          expect(idArticleRecu).to.be(idArticle);
        });
      }
    );
  });

  it('construis le cms crisp avec les bons paramètres', () => {
    const cmsCrisp = new CmsCrisp({
      adaptateurEnvironnement,
    });

    expect(cmsCrisp.adaptateurCmsCrisp.urlBase).to.be(
      `https://api.crisp.chat/v1/website/id-site/`
    );
    expect(cmsCrisp.adaptateurCmsCrisp.enteteCrisp.headers.Authorization).to.be(
      `Basic Y2xl`
    );
  });
});
