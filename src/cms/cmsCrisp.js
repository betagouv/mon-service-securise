import { CmsCrisp } from '@lab-anssi/lib';

class CmsCrispMss extends CmsCrisp {
  constructor({ adaptateurEnvironnement }) {
    super(
      adaptateurEnvironnement.crisp().idSite(),
      adaptateurEnvironnement.crisp().cleApi()
    );
    this.adaptateurEnvironnement = adaptateurEnvironnement;
  }

  async recupereDevenirAmbassadeur() {
    return this.recupereArticle(
      this.adaptateurEnvironnement.crisp().idArticleDevenirAmbassadeur()
    );
  }

  async recupereFaireConnaitre() {
    return this.recupereArticle(
      this.adaptateurEnvironnement.crisp().idArticleFaireConnaitre()
    );
  }

  async recupereRoadmap() {
    return this.recupereArticle(
      this.adaptateurEnvironnement.crisp().idArticleRoadmap()
    );
  }

  async recupereArticleBlog(slug) {
    return this.recupereArticleCategorie(
      slug,
      this.adaptateurEnvironnement.crisp().idCategorieBlog()
    );
  }

  async recupereSectionsBlog() {
    return this.recupereSectionsCategorie(
      this.adaptateurEnvironnement.crisp().idCategorieBlog()
    );
  }

  async recupereArticlesBlog() {
    return this.recupereArticlesCategorie(
      this.adaptateurEnvironnement.crisp().idCategorieBlog()
    );
  }
}

export default CmsCrispMss;
