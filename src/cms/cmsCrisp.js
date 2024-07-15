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
    const { contenuMarkdown, titre } =
      await this.adaptateurCmsCrisp.recupereDevenirAmbassadeur();
    const contenu = this.constructeurCrispMarkdown(contenuMarkdown).versHTML();

    return {
      titre,
      contenu,
    };
  }

  async recupereFaireConnaitre() {
    const { contenuMarkdown, titre } =
      await this.adaptateurCmsCrisp.recupereFaireConnaitreMSS();
    const contenu = this.constructeurCrispMarkdown(contenuMarkdown).versHTML();

    return {
      titre,
      contenu,
    };
  }
}

module.exports = CmsCrisp;
