const fabriqueCrispMarkdown = require('./fabriqueCrispMarkdown');
const { ErreurArticleCrispIntrouvable } = require('../erreurs');

const extraitSlugArticle = (article) => {
  try {
    const regex = /\/article\/(.*)-[a-zA-Z0-9]{1,10}\//gm;
    return regex.exec(article.url)[1];
  } catch (e) {
    return null;
  }
};

class CmsCrisp {
  constructor({
    adaptateurCmsCrisp,
    constructeurCrispMarkdown = fabriqueCrispMarkdown,
  }) {
    if (!adaptateurCmsCrisp) {
      throw new Error("Impossible d'instancier le CMS sans adaptateur");
    }
    this.adaptateurCmsCrisp = adaptateurCmsCrisp;
    this.constructeurCrispMarkdown = constructeurCrispMarkdown;
  }

  convertitArticle(article) {
    const { contenuMarkdown, titre, description } = article;
    const crispMarkdown = this.constructeurCrispMarkdown(contenuMarkdown);
    const contenu = crispMarkdown.versHTML();

    return {
      titre,
      contenu,
      description,
      tableDesMatieres: crispMarkdown.tableDesMatieres(),
    };
  }

  async recupereDevenirAmbassadeur() {
    const article = await this.adaptateurCmsCrisp.recupereDevenirAmbassadeur();
    return this.convertitArticle(article);
  }

  async recupereFaireConnaitre() {
    const article = await this.adaptateurCmsCrisp.recupereFaireConnaitreMSS();
    return this.convertitArticle(article);
  }

  async recuperePromouvoir() {
    const article = await this.adaptateurCmsCrisp.recuperePromouvoir();
    return this.convertitArticle(article);
  }

  async recupereRoadmap() {
    const article = await this.adaptateurCmsCrisp.recupereRoadmap();
    return this.convertitArticle(article);
  }

  async recupereArticleBlog(slug) {
    try {
      const articles = await this.adaptateurCmsCrisp.recupereArticlesBlog();
      const article = articles.find((a) => extraitSlugArticle(a) === slug);
      if (!article) {
        throw new ErreurArticleCrispIntrouvable();
      }
      const articleCrisp = await this.adaptateurCmsCrisp.recupereArticle(
        article.id
      );
      return {
        ...this.convertitArticle(articleCrisp),
        section: { id: article.section?.id, nom: article.section?.nom },
      };
    } catch (e) {
      throw new ErreurArticleCrispIntrouvable();
    }
  }

  async recupereSectionsBlog() {
    return this.adaptateurCmsCrisp.recupereSectionsBlog();
  }

  async recupereArticlesBlog() {
    const articles = await this.adaptateurCmsCrisp.recupereArticlesBlog();
    return articles.map((article) => {
      const slug = extraitSlugArticle(article);
      const url = slug ? `/articles/${slug}` : null;
      return { ...article, url };
    });
  }
}

module.exports = CmsCrisp;
