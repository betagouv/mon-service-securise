const CaracteristiquesComplementaires = require('./caracteristiquesComplementaires');
const Mesure = require('./mesure');

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
    mesures = [],
    caracteristiquesComplementaires = {},
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
    this.mesures = mesures.map((donneesMesure) => new Mesure(donneesMesure, referentiel));
    this.caracteristiquesComplementaires = new CaracteristiquesComplementaires(
      caracteristiquesComplementaires, referentiel,
    );

    this.referentiel = referentiel;
  }

  descriptionNatureService() { return this.referentiel.natureService(this.natureService); }

  localisationDonnees() {
    return this.caracteristiquesComplementaires.descriptionLocalisationDonnees();
  }

  hebergeur() { return this.caracteristiquesComplementaires.descriptionHebergeur(); }

  presentation() { return this.caracteristiquesComplementaires.presentation; }

  structureDeveloppement() { return this.caracteristiquesComplementaires.structureDeveloppement; }

  toJSON() {
    return {
      id: this.id,
      nomService: this.nomService,
    };
  }
}

module.exports = Homologation;
