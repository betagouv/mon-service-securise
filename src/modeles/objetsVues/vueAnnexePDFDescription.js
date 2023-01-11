class VueAnnexePDFDescription {
  constructor(homologation) {
    this.homologation = homologation;
  }

  donnees() {
    return { nomService: this.homologation.nomService() };
  }
}

module.exports = VueAnnexePDFDescription;
