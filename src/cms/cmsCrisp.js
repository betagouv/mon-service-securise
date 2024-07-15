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
    const contenu = this.constructeurCrispMarkdown(contenuMarkdown).versHTML();

    return {
      titre,
      contenu,
      description,
    };
  }

  async recupereFaireConnaitre() {
    const { contenuMarkdown, titre, description } =
      await this.adaptateurCmsCrisp.recupereFaireConnaitreMSS();
    const contenu = this.constructeurCrispMarkdown(contenuMarkdown).versHTML();

    return {
      titre,
      contenu,
      description,
    };
  }
}

module.exports = CmsCrisp;
