import {
  ArticleCrispAvecSection,
  ResumeArticleCrispAvecSlug,
  SectionCrisp,
} from '@lab-anssi/lib';
import CmsCrisp from '../../src/cms/cmsCrisp.ts';
import { AdaptateurEnvironnement } from '../../src/adaptateurs/adaptateurEnvironnement.interface.ts';

describe('Le CMS Crisp', () => {
  let adaptateurEnvironnement: AdaptateurEnvironnement;

  beforeEach(() => {
    adaptateurEnvironnement = {
      crisp: () => ({
        idSite: () => 'id-site',
        cleApi: () => 'cle',
        idCategorieBlog: () => 'id-blog',
      }),
    } as unknown as AdaptateurEnvironnement;
  });

  describe("sur demande d'un article de la catégorie `blog`", () => {
    it("utilise le cms crisp pour récupérer l'article", async () => {
      const cmsCrisp = new CmsCrisp({ adaptateurEnvironnement });
      let slugUtilise;
      let idCategorieUtilise;

      cmsCrisp.recupereArticleCategorie = async (slug, idCategorie) => {
        slugUtilise = slug;
        idCategorieUtilise = idCategorie;
        return 'article-avec-slug' as unknown as ArticleCrispAvecSection;
      };

      const article = await cmsCrisp.recupereArticleBlog('un-slug');

      expect(slugUtilise).toBe('un-slug');
      expect(idCategorieUtilise).toBe('id-blog');
      expect(article).toBe('article-avec-slug');
    });
  });

  describe('sur demande des sections de la catégorie `blog`', () => {
    it('utilise le cms crisp pour récupérer les sections', async () => {
      const cmsCrisp = new CmsCrisp({ adaptateurEnvironnement });
      let idCategorieUtilise;

      cmsCrisp.recupereSectionsCategorie = async (idCategorie) => {
        idCategorieUtilise = idCategorie;
        return 'sections' as unknown as SectionCrisp[];
      };

      const sections = await cmsCrisp.recupereSectionsBlog();

      expect(idCategorieUtilise).toBe('id-blog');
      expect(sections).toBe('sections');
    });
  });

  describe('sur demande des articles de la catégorie `blog`', () => {
    it('utilise le cms crisp pour récupérer les articles', async () => {
      const cmsCrisp = new CmsCrisp({ adaptateurEnvironnement });
      let idCategorieUtilise;

      cmsCrisp.recupereArticlesCategorie = async (idCategorie) => {
        idCategorieUtilise = idCategorie;
        return 'articles-de-la-categorie' as unknown as ResumeArticleCrispAvecSlug[];
      };

      const articles = await cmsCrisp.recupereArticlesBlog();

      expect(idCategorieUtilise).toBe('id-blog');
      expect(articles).toBe('articles-de-la-categorie');
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
          } as unknown as AdaptateurEnvironnement;

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

          // @ts-expect-error On force l'appel
          await cmsCrisp[nomMethodeCMS]();

          expect(idArticleRecu).toBe(idArticle);
        });
      }
    );
  });

  it('construis le cms crisp avec les bons paramètres', () => {
    const cmsCrisp = new CmsCrisp({
      adaptateurEnvironnement,
    });

    expect(cmsCrisp.adaptateurCmsCrisp.urlBase).toBe(
      `https://api.crisp.chat/v1/website/id-site/`
    );
    expect(cmsCrisp.adaptateurCmsCrisp.enteteCrisp.headers.Authorization).toBe(
      `Basic Y2xl`
    );
  });
});
