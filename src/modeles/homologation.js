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
const Autorisation = require('./autorisations/autorisation');
const SuggestionAction = require('./suggestionAction');

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
      descriptionService = {},
      dossiers = [],
      mesuresSpecifiques = [],
      risquesGeneraux = [],
      risquesSpecifiques = [],
      rolesResponsabilites = {},
      suggestionsActions = [],
    } = donnees;

    this.id = id;
    this.contributeurs = contributeurs.map((c) => new Utilisateur(c));
    this.descriptionService = new DescriptionService(
      descriptionService,
      referentiel
    );
    this.dossiers = new Dossiers({ dossiers }, referentiel);

    let { mesuresGenerales = [] } = donnees;
    const mesuresPersonnalisees = moteurRegles.mesures(this.descriptionService);
    mesuresGenerales = mesuresGenerales.map((mesure) => ({
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
    this.suggestionsActions = suggestionsActions.map(
      (s) => new SuggestionAction(s, referentiel)
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
      ...this.mesures.completude(),
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
      Autorisation.DROITS_ANNEXES_PDF
    );
    const droitALaSyntheseSecurite = autorisation.aLesPermissions(
      Autorisation.DROIT_SYNTHESE_SECURITE_PDF
    );
    const droitAuDossierDecision = autorisation.aLesPermissions(
      Autorisation.DROITS_DOSSIER_DECISION_PDF
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
    this.dossiers.finaliseDossierCourant(this.indiceCyber().total);
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

  metsAJourMesureGenerale(mesure) {
    this.mesures.mesuresGenerales.metsAJourMesure(mesure);
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
    return this.statistiquesMesuresGenerales().toutesCategories.sansStatut;
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

  statistiquesMesuresGenerales() {
    return this.mesures.statistiquesMesuresGenerales();
  }

  statistiquesMesuresIndispensables() {
    return this.statistiquesMesuresGenerales().indispensables();
  }

  statistiquesMesuresRecommandees() {
    return this.statistiquesMesuresGenerales().recommandees();
  }

  statutSaisie(nomInformationsHomologation) {
    return this[nomInformationsHomologation].statutSaisie();
  }

  structureDeveloppement() {
    return this.rolesResponsabilites.descriptionStructureDeveloppement();
  }

  supprimeDossierCourant() {
    this.dossiers.supprimeDossierCourant();
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

  aUneSuggestionDAction() {
    return this.suggestionsActions.length > 0;
  }

  pourraitFaire(natureSuggestion) {
    return this.suggestionsActions.some((s) => s.nature === natureSuggestion);
  }

  routesDesSuggestionsActions() {
    return this.suggestionsActions
      .sort((s1, s2) => s1.priorite - s2.priorite)
      .map((s) => s.route());
  }

  static creePourUnUtilisateur(utilisateur) {
    const donneesService = {
      descriptionService: {
        nombreOrganisationsUtilisatrices: {
          borneBasse: 0,
          borneHaute: 0,
        },
        organisationResponsable: utilisateur.entite,
      },
    };

    return new Homologation(donneesService);
  }
}

Object.assign(Homologation, NIVEAUX);

module.exports = Homologation;
