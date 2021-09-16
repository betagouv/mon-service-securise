const Referentiel = require('../referentiel');
const AvisExpertCyber = require('./avisExpertCyber');
const CaracteristiquesComplementaires = require('./caracteristiquesComplementaires');
const InformationsGenerales = require('./informationsGenerales');
const InformationsHomologation = require('./informationsHomologation');
const Mesures = require('./mesures');
const PartiesPrenantes = require('./partiesPrenantes');
const Risque = require('./risque');

const NIVEAUX = {
  NIVEAU_SECURITE_BON: 'bon',
  NIVEAU_SECURITE_SATISFAISANT: 'satisfaisant',
  NIVEAU_SECURITE_A_RENFORCER: 'aRenforcer',
  NIVEAU_SECURITE_INSUFFISANT: 'insuffisant',
};

class Homologation {
  constructor(donnees, referentiel = Referentiel.creeReferentielVide()) {
    const {
      id = '',
      idUtilisateur,
      informationsGenerales = {},
      mesures = [],
      caracteristiquesComplementaires = {},
      partiesPrenantes = {},
      risques = [],
      risquesVerifies = false,
      avisExpertCyber = {},
    } = donnees;

    this.id = id;
    this.idUtilisateur = idUtilisateur;
    this.informationsGenerales = new InformationsGenerales(informationsGenerales, referentiel);
    this.mesures = new Mesures({ mesures }, referentiel);
    this.caracteristiquesComplementaires = new CaracteristiquesComplementaires(
      caracteristiquesComplementaires, referentiel,
    );
    this.partiesPrenantes = new PartiesPrenantes(partiesPrenantes);
    this.risques = risques.map((donneesRisque) => new Risque(donneesRisque, referentiel));
    this.risquesVerifies = risquesVerifies;
    this.avisExpertCyber = new AvisExpertCyber(avisExpertCyber, referentiel);

    this.referentiel = referentiel;
  }

  autoriteHomologation() { return this.partiesPrenantes.autoriteHomologation; }

  descriptionAutoriteHomologation() {
    return this.partiesPrenantes.descriptionAutoriteHomologation();
  }

  descriptionEquipePreparation() {
    return this.partiesPrenantes.descriptionEquipePreparation();
  }

  descriptionExpiration() {
    return this.avisExpertCyber.descriptionExpiration();
  }

  descriptionNatureService() { return this.informationsGenerales.descriptionNatureService(); }

  expertCybersecurite() { return this.partiesPrenantes.expertCybersecurite; }

  fonctionAutoriteHomologation() { return this.partiesPrenantes.fonctionAutoriteHomologation; }

  hebergeur() { return this.caracteristiquesComplementaires.descriptionHebergeur(); }

  localisationDonnees() {
    return this.caracteristiquesComplementaires.descriptionLocalisationDonnees();
  }

  niveauSecurite() {
    const proportionIndispensables = this.proportionMesuresIndispensablesMisesEnOeuvre();
    const proportionRecommandees = this.proportionMesuresRecommandeesMisesEnOeuvre();

    if (proportionIndispensables === 1) {
      return proportionRecommandees >= 0.5
        ? NIVEAUX.NIVEAU_SECURITE_BON
        : NIVEAUX.NIVEAU_SECURITE_SATISFAISANT;
    }

    if (proportionIndispensables >= 0.75) return NIVEAUX.NIVEAU_SECURITE_A_RENFORCER;

    return NIVEAUX.NIVEAU_SECURITE_INSUFFISANT;
  }

  nomService() { return this.informationsGenerales.nomService; }

  piloteProjet() { return this.partiesPrenantes.piloteProjet; }

  presentation() { return this.caracteristiquesComplementaires.presentation; }

  proportionMesuresIndispensablesMisesEnOeuvre() {
    return this.mesures.proportionIndispensablesMisesEnOeuvre();
  }

  proportionMesuresRecommandeesMisesEnOeuvre() {
    return this.mesures.proportionRecommandeesMisesEnOeuvre();
  }

  seuilCriticiteTropEleve() {
    const seuil = this.informationsGenerales.seuilCriticite();
    return seuil === 'eleve' || seuil === 'critique';
  }

  statistiquesMesures() {
    return this.mesures.statistiques();
  }

  mesuresNonSaisies() {
    return this.mesures.nonSaisies();
  }

  statutSaisie(nomInformationsHomologation) {
    if (nomInformationsHomologation === 'risques') {
      return this.risquesVerifies
        ? InformationsHomologation.COMPLETES
        : InformationsHomologation.A_SAISIR;
    }
    return this[nomInformationsHomologation].statutSaisie();
  }

  structureDeveloppement() { return this.caracteristiquesComplementaires.structureDeveloppement; }

  toJSON() {
    return {
      id: this.id,
      nomService: this.nomService(),
    };
  }
}

Object.assign(Homologation, NIVEAUX);

module.exports = Homologation;
