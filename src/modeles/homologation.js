class Homologation {
  constructor({
    id = '',
    idUtilisateur,
    nomService,
    natureService = [],
    provenanceService,
    dejaMisEnLigne,
    fonctionnalites,
    donneesCaracterePersonnel,
    delaiAvantImpactCritique,
    presenceResponsable,
  }, referentiel) {
    this.id = id;
    this.idUtilisateur = idUtilisateur;
    this.nomService = nomService;
    this.natureService = natureService;
    this.provenanceService = provenanceService;
    this.dejaMisEnLigne = dejaMisEnLigne;
    this.fonctionnalites = fonctionnalites;
    this.donneesCaracterePersonnel = donneesCaracterePersonnel;
    this.delaiAvantImpactCritique = delaiAvantImpactCritique;
    this.presenceResponsable = presenceResponsable;

    this.referentiel = referentiel;
  }

  descriptionNatureService() {
    return this.referentiel.natureService(this.natureService);
  }

  toJSON() {
    return {
      id: this.id,
      nomService: this.nomService,
    };
  }
}

module.exports = Homologation;
