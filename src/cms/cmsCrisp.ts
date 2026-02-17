import { CmsCrisp } from '@lab-anssi/lib';
import { AdaptateurEnvironnement } from '../adaptateurs/adaptateurEnvironnement.interface.js';

class CmsCrispMss extends CmsCrisp {
  private readonly adaptateurEnvironnement: AdaptateurEnvironnement;

  constructor({
    adaptateurEnvironnement,
  }: {
    adaptateurEnvironnement: AdaptateurEnvironnement;
  }) {
    super(
      adaptateurEnvironnement.crisp().idSite()!,
      adaptateurEnvironnement.crisp().cleApi()!
    );
    this.adaptateurEnvironnement = adaptateurEnvironnement;
  }

  async recupereDevenirAmbassadeur() {
    return this.recupereArticle(
      this.adaptateurEnvironnement.crisp().idArticleDevenirAmbassadeur()!
    );
  }

  async recupereFaireConnaitre() {
    return this.recupereArticle(
      this.adaptateurEnvironnement.crisp().idArticleFaireConnaitre()!
    );
  }

  async recupereRoadmap() {
    return this.recupereArticle(
      this.adaptateurEnvironnement.crisp().idArticleRoadmap()!
    );
  }

  async recupereArticleBlog(slug: string) {
    return this.recupereArticleCategorie(
      slug,
      this.adaptateurEnvironnement.crisp().idCategorieBlog()!
    );
  }

  async recupereSectionsBlog() {
    return this.recupereSectionsCategorie(
      this.adaptateurEnvironnement.crisp().idCategorieBlog()!
    );
  }

  async recupereArticlesBlog() {
    return this.recupereArticlesCategorie(
      this.adaptateurEnvironnement.crisp().idCategorieBlog()!
    );
  }
}

export default CmsCrispMss;
