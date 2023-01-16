const MoteurRegles = require('../moteurRegles');
const Referentiel = require('../referentiel');

const AvisExpertCyber = require('./avisExpertCyber');
const DescriptionService = require('./descriptionService');
const Dossiers = require('./dossiers');
const Mesure = require('./mesure');
const Mesures = require('./mesures');
const Risques = require('./risques');
const RolesResponsabilites = require('./rolesResponsabilites');
const Utilisateur = require('./utilisateur');
const VueAnnexePDFDescription = require('./objetsVues/vueAnnexePDFDescription');
const VueAnnexePDFMesures = require('./objetsVues/vueAnnexePDFMesures');
const VueAnnexePDFRisques = require('./objetsVues/vueAnnexePDFRisques');

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
      dossiers = [],
      mesuresSpecifiques = [],
      risquesGeneraux = [],
      risquesSpecifiques = [],
      rolesResponsabilites = {},
      avisExpertCyber = {},
    } = donnees;

    this.id = id;
    if (createur.email) this.createur = new Utilisateur(createur);
    this.contributeurs = contributeurs.map((c) => new Utilisateur(c));
    this.descriptionService = new DescriptionService(descriptionService, referentiel);
    this.dossiers = new Dossiers({ dossiers }, referentiel);

    let { mesuresGenerales = [] } = donnees;
    const mesuresPersonnalisees = moteurRegles.mesures(this.descriptionService);
    const idMesuresPersonnalisees = Object.keys(mesuresPersonnalisees);
    mesuresGenerales = mesuresGenerales
      .filter((mesure) => idMesuresPersonnalisees.includes(mesure.id))
      .map((mesure) => ({
        ...mesure,
        rendueIndispensable: !!mesuresPersonnalisees[mesure.id]?.indispensable,
      }));
    this.mesures = new Mesures(
      { mesuresGenerales, mesuresSpecifiques },
      referentiel,
      mesuresPersonnalisees,
    );

    this.rolesResponsabilites = new RolesResponsabilites(rolesResponsabilites);
    this.risques = new Risques(
      { risquesGeneraux, risquesSpecifiques },
      referentiel,
    );
    this.avisExpertCyber = new AvisExpertCyber(avisExpertCyber, referentiel);

    this.referentiel = referentiel;
  }

  autoriteHomologation() { return this.rolesResponsabilites.autoriteHomologation; }

  indiceCyber() { return this.mesures.indiceCyber(); }

  completudeMesures() {
    return this.statistiquesMesures().completude();
  }

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

  descriptionLocalisationDonnees() {
    return this.descriptionService.descriptionLocalisationDonnees();
  }

  descriptionTypeService() { return this.descriptionService.descriptionTypeService(); }

  descriptionStatutDeploiement() { return this.descriptionService.descriptionStatutDeploiement(); }

  descriptionStatutsMesures() {
    return Mesure.statutsPossibles().reduce((acc, s) => {
      acc[s] = { description: this.referentiel.descriptionStatutMesure(s) };
      return acc;
    }, {});
  }

  dossierCourant() {
    return this.dossiers.dossierCourant();
  }

  expertCybersecurite() { return this.rolesResponsabilites.expertCybersecurite; }

  fonctionAutoriteHomologation() { return this.rolesResponsabilites.fonctionAutoriteHomologation; }

  gouvernance() {
    return this.rolesResponsabilites.descriptionGouvernance();
  }

  hebergeur() { return this.rolesResponsabilites.descriptionHebergeur(); }

  localisationDonnees() {
    return this.descriptionService.localisationDonnees;
  }

  mesuresParStatutEtCategorie() {
    return this.mesures.parStatutEtCategorie();
  }

  mesuresSpecifiques() { return this.mesures.mesuresSpecifiques; }

  nombreDossiers() {
    return this.dossiers.nombre();
  }

  nombreMesuresSpecifiques() {
    return this.mesures.nombreMesuresSpecifiques();
  }

  nombreTotalMesuresGenerales() {
    return this.mesures.nombreTotalMesuresGenerales();
  }

  nombreTotalMesuresARemplirToutesCategories() {
    return this.statistiquesMesures().aRemplirToutesCategories();
  }

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

  statistiquesMesuresIndispensables() {
    return this.statistiquesMesures().indispensables();
  }

  statistiquesMesuresRecommandees() {
    return this.statistiquesMesures().recommandees();
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

  vueAnnexePDFDescription() {
    return new VueAnnexePDFDescription(this, this.referentiel);
  }

  vueAnnexePDFMesures() {
    return new VueAnnexePDFMesures(this, this.referentiel);
  }

  vueAnnexePDFRisques() {
    return new VueAnnexePDFRisques(this, this.referentiel);
  }
}

Object.assign(Homologation, NIVEAUX);

module.exports = Homologation;
