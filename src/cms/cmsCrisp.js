const fabriqueCrispMarkdown = require('./fabriqueCrispMarkdown');

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

  async recupereDevenirAmbassadeur() {
    const { contenuMarkdown, titre, description } =
      await this.adaptateurCmsCrisp.recupereDevenirAmbassadeur();
    const crispMarkdown = this.constructeurCrispMarkdown(contenuMarkdown);
    const contenu = crispMarkdown.versHTML();

    return {
      titre,
      contenu,
      description,
      tableDesMatieres: crispMarkdown.tableDesMatieres(),
    };
  }

  async recupereFaireConnaitre() {
    const { contenuMarkdown, titre, description } =
      await this.adaptateurCmsCrisp.recupereFaireConnaitreMSS();
    const crispMarkdown = this.constructeurCrispMarkdown(contenuMarkdown);
    const contenu = crispMarkdown.versHTML();

    return {
      titre,
      contenu,
      description,
      tableDesMatieres: crispMarkdown.tableDesMatieres(),
    };
  }

  async recupereArticle(slug) {
    const { contenuMarkdown, titre, description } =
      await this.adaptateurCmsCrisp.recupereArticleBlog(slug);
    const crispMarkdown = this.constructeurCrispMarkdown(contenuMarkdown);
    const contenu = crispMarkdown.versHTML();

    return {
      titre,
      contenu,
      description,
      tableDesMatieres: crispMarkdown.tableDesMatieres(),
    };
  }
}

module.exports = CmsCrisp;
