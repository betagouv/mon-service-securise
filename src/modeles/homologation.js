const MoteurRegles = require('../moteurRegles');
const Referentiel = require('../referentiel');

const DescriptionService = require('./descriptionService');
const Dossiers = require('./dossiers');
const Mesure = require('./mesure');
const Mesures = require('./mesures');
const ObjetPersistanceHomologation = require('./objetsPersistance/objetPersistanceHomologation');
const Risques = require('./risques');
const RolesResponsabilites = require('./rolesResponsabilites');
const Utilisateur = require('./utilisateur');
const ObjetPDFAnnexeDescription = require('./objetsPDF/objetPDFAnnexeDescription');
const ObjetPDFAnnexeMesures = require('./objetsPDF/objetPDFAnnexeMesures');
const ObjetPDFAnnexeRisques = require('./objetsPDF/objetPDFAnnexeRisques');
const AutorisationBase = require('./autorisations/autorisationBase');

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
    moteurRegles = new MoteurRegles(referentiel)
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
    } = donnees;

    this.id = id;
    if (createur.email) this.createur = new Utilisateur(createur);
    this.contributeurs = contributeurs.map((c) => new Utilisateur(c));
    this.descriptionService = new DescriptionService(
      descriptionService,
      referentiel
    );
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
      mesuresPersonnalisees
    );

    this.rolesResponsabilites = new RolesResponsabilites(rolesResponsabilites);
    this.risques = new Risques(
      { risquesGeneraux, risquesSpecifiques },
      referentiel
    );

    this.referentiel = referentiel;
  }

  autoriteHomologation() {
    return this.rolesResponsabilites.autoriteHomologation;
  }

  indiceCyber() {
    return this.mesures.indiceCyber();
  }

  completudeMesures() {
    return {
      ...this.statistiquesMesures().completude(),
      detailMesures: this.mesures.statutsMesuresPersonnalisees(),
      indiceCyber: this.indiceCyber(),
    };
  }

  delegueProtectionDonnees() {
    return this.rolesResponsabilites.delegueProtectionDonnees;
  }

  descriptionLocalisationDonnees() {
    return this.descriptionService.descriptionLocalisationDonnees();
  }

  descriptionTypeService() {
    return this.descriptionService.descriptionTypeService();
  }

  descriptionStatutDeploiement() {
    return this.descriptionService.descriptionStatutDeploiement();
  }

  descriptionStatutsMesures() {
    return Mesure.statutsPossibles().reduce((acc, s) => {
      acc[s] = { description: this.referentiel.descriptionStatutMesure(s) };
      return acc;
    }, {});
  }

  documentsPdfDisponibles(autorisation) {
    const droitAuxAnnexes = autorisation.aLesPermissions(
      AutorisationBase.DROITS_ANNEXES_PDF
    );
    const droitALaSyntheseSecurite = autorisation.aLesPermissions(
      AutorisationBase.DROIT_SYNTHESE_SECURITE_PDF
    );
    const droitAuDossierDecision = autorisation.aLesPermissions(
      AutorisationBase.DROITS_DOSSIER_DECISION_PDF
    );
    const dossierCourant = this.dossierCourant();

    return [
      ...(droitAuxAnnexes ? ['annexes'] : []),
      ...(droitALaSyntheseSecurite ? ['syntheseSecurite'] : []),
      ...(dossierCourant &&
      this.referentiel.etapeSuffisantePourDossierDecision(
        dossierCourant.etapeCourante()
      ) &&
      droitAuDossierDecision
        ? ['dossierDecision']
        : []),
    ];
  }

  donneesAPersister() {
    return new ObjetPersistanceHomologation({
      id: this.id,
      descriptionService: this.descriptionService.donneesSerialisees(),
      dossiers: this.dossiers.donneesSerialisees(),
      mesuresGenerales: this.mesuresGenerales().donneesSerialisees(),
      mesuresSpecifiques: this.mesuresSpecifiques().donneesSerialisees(),
      risquesGeneraux: this.risquesGeneraux().donneesSerialisees(),
      risquesSpecifiques: this.risquesSpecifiques().donneesSerialisees(),
      rolesResponsabilites: this.rolesResponsabilites.donneesSerialisees(),
    });
  }

  dossierCourant() {
    return this.dossiers.dossierCourant();
  }

  expertCybersecurite() {
    return this.rolesResponsabilites.expertCybersecurite;
  }

  finaliseDossierCourant() {
    this.dossiers.finaliseDossierCourant();
  }

  fonctionAutoriteHomologation() {
    return this.rolesResponsabilites.fonctionAutoriteHomologation;
  }

  hebergeur() {
    return this.rolesResponsabilites.descriptionHebergeur();
  }

  localisationDonnees() {
    return this.descriptionService.localisationDonnees;
  }

  mesuresParStatutEtCategorie() {
    return this.mesures.parStatutEtCategorie();
  }

  mesuresGenerales() {
    return this.mesures.mesuresGenerales;
  }

  mesuresSpecifiques() {
    return this.mesures.mesuresSpecifiques;
  }

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

  nomService() {
    return this.descriptionService.nomService;
  }

  piloteProjet() {
    return this.rolesResponsabilites.piloteProjet;
  }

  presentation() {
    return this.descriptionService.presentation;
  }

  risquesGeneraux() {
    return this.risques.risquesGeneraux;
  }

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

  donneesADupliquer(nomService) {
    const donnees = this.donneesAPersister().sauf('dossiers', 'id');
    donnees.descriptionService.nomService = nomService;
    return donnees;
  }

  vueAnnexePDFDescription() {
    return new ObjetPDFAnnexeDescription(this, this.referentiel);
  }

  vueAnnexePDFMesures() {
    return new ObjetPDFAnnexeMesures(this, this.referentiel);
  }

  vueAnnexePDFRisques() {
    return new ObjetPDFAnnexeRisques(this, this.referentiel);
  }
}

Object.assign(Homologation, NIVEAUX);

module.exports = Homologation;
