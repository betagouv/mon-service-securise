const MoteurRegles = require('../moteurRegles');
const Referentiel = require('../referentiel');

const AvisExpertCyber = require('./avisExpertCyber');
const DescriptionService = require('./descriptionService');
const Mesure = require('./mesure');
const Mesures = require('./mesures');
const Risques = require('./risques');
const RolesResponsabilites = require('./rolesResponsabilites');
const Utilisateur = require('./utilisateur');

const NIVEAUX = {
  NIVEAU_SECURITE_BON: 'bon',
  NIVEAU_SECURITE_SATISFAISANT: 'satisfaisant',
  NIVEAU_SECURITE_A_RENFORCER: 'aRenforcer',
  NIVEAU_SECURITE_INSUFFISANT: 'insuffisant',
};

class Homologation {
  constructor(
    donnees,
    referentiel = Referentiel.creeReferentielVide(),
    moteurRegles = new MoteurRegles(referentiel),
  ) {
    const {
      id = '',
      contributeurs = [],
      createur = {},
      descriptionService = {},
      mesuresSpecifiques = [],
      risquesGeneraux = [],
      risquesSpecifiques = [],
      rolesResponsabilites = {},
      avisExpertCyber = {},
    } = donnees;

    let { mesuresGenerales = [] } = donnees;

    this.id = id;
    if (createur.email) this.createur = new Utilisateur(createur);
    this.contributeurs = contributeurs.map((c) => new Utilisateur(c));
    this.descriptionService = new DescriptionService(descriptionService, referentiel);

    const idMesures = Object.keys(moteurRegles.mesures(this.descriptionService));
    mesuresGenerales = mesuresGenerales.filter((m) => idMesures.includes(m.id));
    this.mesures = new Mesures({ mesuresGenerales, mesuresSpecifiques }, referentiel);

    this.rolesResponsabilites = new RolesResponsabilites(rolesResponsabilites);
    this.risques = new Risques(
      { risquesGeneraux, risquesSpecifiques },
      referentiel,
    );
    this.avisExpertCyber = new AvisExpertCyber(avisExpertCyber, referentiel);

    this.referentiel = referentiel;
  }

  acteursHomologation() {
    return this.rolesResponsabilites.descriptionActeursHomologation();
  }

  autoriteHomologation() { return this.rolesResponsabilites.autoriteHomologation; }

  delegueProtectionDonnees() {
    return this.rolesResponsabilites.delegueProtectionDonnees;
  }

  descriptionAutoriteHomologation() {
    return this.rolesResponsabilites.descriptionAutoriteHomologation();
  }

  descriptionEquipePreparation() {
    return this.rolesResponsabilites.descriptionEquipePreparation();
  }

  descriptionExpiration() {
    return this.avisExpertCyber.descriptionExpiration();
  }

  descriptionTypeService() { return this.descriptionService.descriptionTypeService(); }

  descriptionStatutsMesures() {
    return Mesure.statutsPossibles().reduce((acc, s) => {
      acc[s] = { description: this.referentiel.descriptionStatutMesure(s) };
      return acc;
    }, {});
  }

  expertCybersecurite() { return this.rolesResponsabilites.expertCybersecurite; }

  fonctionAutoriteHomologation() { return this.rolesResponsabilites.fonctionAutoriteHomologation; }

  hebergeur() { return this.rolesResponsabilites.descriptionHebergeur(); }

  localisationDonnees() {
    return this.descriptionService.descriptionLocalisationDonnees();
  }

  mesuresSpecifiques() { return this.mesures.mesuresSpecifiques; }

  nomService() { return this.descriptionService.nomService; }

  piloteProjet() { return this.rolesResponsabilites.piloteProjet; }

  presentation() { return this.descriptionService.presentation; }

  risquesPrincipaux() {
    return this.risques.principaux();
  }

  risquesSpecifiques() {
    return this.risques.risquesSpecifiques;
  }

  statistiquesMesures() {
    return this.mesures.statistiques();
  }

  statutSaisie(nomInformationsHomologation) {
    return this[nomInformationsHomologation].statutSaisie();
  }

  structureDeveloppement() {
    return this.rolesResponsabilites.descriptionStructureDeveloppement();
  }

  toJSON() {
    return {
      id: this.id,
      createur: this.createur.toJSON(),
      contributeurs: this.contributeurs.map((c) => c.toJSON()),
      nomService: this.nomService(),
    };
  }
}

Object.assign(Homologation, NIVEAUX);

module.exports = Homologation;
