import MoteurRegles from '../moteurRegles/v1/moteurRegles.js';
import * as Referentiel from '../referentiel.js';
import DescriptionService from './descriptionService.js';
import Dossiers from './dossiers.js';
import Mesures from './mesures.js';
import ObjetPersistanceService from './objetsPersistance/objetPersistanceService.js';
import Risques from './risques.js';
import RolesResponsabilites from './rolesResponsabilites.js';
import ObjetPDFAnnexeDescription from './objetsPDF/objetPDFAnnexeDescription.js';
import ObjetPDFAnnexeMesures from './objetsPDF/objetPDFAnnexeMesures.js';
import ObjetPDFAnnexeRisques from './objetsPDF/objetPDFAnnexeRisques.js';
import { Autorisation } from './autorisations/autorisation.js';
import SuggestionAction from './suggestionAction.js';
import { dateEnIso } from '../utilitaires/date.js';
import { Contributeur } from './contributeur.js';
import { DescriptionServiceV2 } from './descriptionServiceV2.js';
import Entite from './entite.js';
import { VersionService } from './versionService.js';
import { MoteurReglesV2 } from '../moteurRegles/v2/moteurReglesV2.js';
import { creeReferentielV2 } from '../referentielV2.js';
import { ObjetPDFAnnexeDescriptionV2 } from './objetsPDF/objetPDFAnnexeDescriptionV2.js';
import { ToutesActionsRecommandees } from './actionsRecommandees.js';
import MesuresGenerales from './mesuresGenerales.js';
import { MoteurRisquesV2 } from '../moteurRisques/v2/moteurRisques.js';

const NIVEAUX = {
  NIVEAU_SECURITE_BON: 'bon',
  NIVEAU_SECURITE_SATISFAISANT: 'satisfaisant',
  NIVEAU_SECURITE_A_RENFORCER: 'aRenforcer',
  NIVEAU_SECURITE_INSUFFISANT: 'insuffisant',
};

function fabriqueMoteurDeRegles(donnees, referentiel) {
  if (donnees.versionService === VersionService.v2) {
    return new MoteurReglesV2(referentiel, referentiel.reglesMoteurV2());
  }
  return new MoteurRegles(referentiel);
}

class Service {
  constructor(
    donnees,
    referentiel = donnees.versionService === VersionService.v2
      ? creeReferentielV2()
      : Referentiel.creeReferentielVide(),
    moteurRegles = fabriqueMoteurDeRegles(donnees, referentiel)
  ) {
    const {
      id = '',
      versionService,
      contributeurs = [],
      descriptionService = {},
      dossiers = [],
      mesuresSpecifiques = [],
      risquesGeneraux = [],
      risquesSpecifiques = [],
      rolesResponsabilites = {},
      suggestionsActions = [],
      prochainIdNumeriqueDeRisqueSpecifique = 1,
      modelesDisponiblesDeMesureSpecifique = {},
      aUneSimulationMigrationReferentiel = false,
    } = donnees;

    this.id = id;
    this.versionService = versionService;
    this.prochainIdNumeriqueDeRisqueSpecifique =
      prochainIdNumeriqueDeRisqueSpecifique;
    this.contributeurs = contributeurs.map((c) => new Contributeur(c));
    this.descriptionService =
      versionService === VersionService.v2
        ? new DescriptionServiceV2(descriptionService, referentiel)
        : new DescriptionService(descriptionService, referentiel);
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
      mesuresPersonnalisees,
      modelesDisponiblesDeMesureSpecifique
    );

    this.rolesResponsabilites = new RolesResponsabilites(rolesResponsabilites);
    this.risques = new Risques(
      { risquesGeneraux, risquesSpecifiques },
      referentiel
    );
    this.suggestionsActions = suggestionsActions.map(
      (s) => new SuggestionAction(s, referentiel)
    );
    this.aUneSimulationMigrationReferentiel =
      aUneSimulationMigrationReferentiel;

    this.referentiel = referentiel;

    if (versionService === VersionService.v2)
      this.moteurRisques = new MoteurRisquesV2(
        this.descriptionService,
        this.mesures.enrichiesAvecDonneesPersonnalisees()
      );
  }

  version() {
    return this.versionService;
  }

  autoriteHomologation() {
    return this.rolesResponsabilites.autoriteHomologation;
  }

  indiceCyber() {
    return this.mesures.indiceCyber();
  }

  indiceCyberPersonnalise() {
    return this.mesures.indiceCyberPersonnalise();
  }

  completudeMesures() {
    const completude = this.mesures.completude();
    const { nombreTotalMesures, nombreMesuresCompletes } = completude;

    const { mesuresGenerales } =
      this.mesures.enrichiesAvecDonneesPersonnalisees();

    const detailMesures = Object.entries(mesuresGenerales)
      .filter(([_id, body]) => !!body.statut)
      .map(([id, { statut, priorite, echeance, responsables }]) => ({
        idMesure: id,
        statut,
        ...(priorite && { priorite }),
        ...(echeance && { echeance: dateEnIso(echeance) }),
        nbResponsables: responsables.length,
      }));

    return {
      nombreTotalMesures,
      nombreMesuresCompletes,
      detailMesures,
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

  migreVersV2(descriptionServiceV2, donneesMesuresGenerales, referentiel) {
    this.referentiel = referentiel;
    DescriptionServiceV2.valideDonneesCreation(
      descriptionServiceV2.donneesSerialisees()
    );
    this.versionService = VersionService.v2;
    this.descriptionService = descriptionServiceV2;
    this.mesures.mesuresGenerales = new MesuresGenerales(
      { mesuresGenerales: donneesMesuresGenerales },
      referentiel
    );
  }

  donneesAPersister() {
    return new ObjetPersistanceService({
      id: this.id,
      descriptionService: this.descriptionService.donneesSerialisees(),
      dossiers: this.dossiers.donneesSerialisees(),
      mesuresGenerales: this.mesuresGenerales().donneesSerialisees(),
      mesuresSpecifiques: this.mesuresSpecifiques().donneesSerialisees(),
      risquesGeneraux: this.risquesGeneraux().donneesSerialisees(),
      risquesSpecifiques: this.risquesSpecifiques().donneesSerialisees(),
      rolesResponsabilites: this.rolesResponsabilites.donneesSerialisees(),
      prochainIdNumeriqueDeRisqueSpecifique:
        this.prochainIdNumeriqueDeRisqueSpecifique,
      versionService: this.versionService,
    });
  }

  dossierCourant() {
    return this.dossiers.dossierCourant();
  }

  expertCybersecurite() {
    return this.rolesResponsabilites.expertCybersecurite;
  }

  finaliseDossierCourant() {
    this.dossiers.finaliseDossierCourant(
      this.indiceCyber().total,
      this.indiceCyberPersonnalise().total
    );
  }

  fonctionAutoriteHomologation() {
    return this.rolesResponsabilites.fonctionAutoriteHomologation;
  }

  hebergeur() {
    return this.rolesResponsabilites.descriptionHebergeur();
  }

  localisationDonnees() {
    return this.descriptionService.identifiantLocalisationDonnees();
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

  associeMesureSpecifiqueAuModele(idModele, idNouvelleMesure) {
    this.mesures.mesuresSpecifiques.associeAuModele(idModele, idNouvelleMesure);
  }

  detacheMesureSpecfiqueDuModele(idModele) {
    this.mesures.mesuresSpecifiques.detacheMesureDuModele(idModele);
  }

  supprimeMesureSpecifiqueAssocieeAuModele(idModele) {
    this.mesures.mesuresSpecifiques.supprimeMesureAssocieeAuModele(idModele);
  }

  metsAJourMesureGenerale(mesure) {
    const idUtilisateurs = this.contributeurs.map((u) => u.idUtilisateur);
    mesure.responsables = mesure.responsables.filter((r) =>
      idUtilisateurs.includes(r)
    );
    this.mesures.mesuresGenerales.metsAJourMesure(mesure);
  }

  supprimeResponsableMesures(idUtilisateur) {
    this.mesures.supprimeResponsable(idUtilisateur);
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

  nombreTotalMesuresNonFait() {
    return this.mesures.nombreTotalNonFait();
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

  siretDeOrganisation() {
    return this.descriptionService.organisationResponsable.siret;
  }

  statistiquesMesuresGeneralesEtSpecifiques(exclueMesuresNonPrisesEnCompte) {
    return this.mesures.statistiquesMesuresGeneralesEtSpecifiques(
      exclueMesuresNonPrisesEnCompte
    );
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

  statutSaisie(nomInformationsService) {
    return this[nomInformationsService].statutSaisie();
  }

  structureDeveloppement() {
    return this.rolesResponsabilites.descriptionStructureDeveloppement();
  }

  supprimeDossierCourant() {
    this.dossiers.supprimeDossierCourant();
  }

  donneesADupliquer(nomService, siret) {
    const donnees = this.donneesAPersister().sauf('dossiers', 'id');
    donnees.descriptionService.nomService = nomService;
    donnees.descriptionService.organisationResponsable.siret = siret;
    return donnees;
  }

  vueAnnexePDFDescription() {
    return this.version() === VersionService.v1
      ? new ObjetPDFAnnexeDescription(this, this.referentiel)
      : new ObjetPDFAnnexeDescriptionV2(this);
  }

  vueAnnexePDFMesures() {
    return new ObjetPDFAnnexeMesures(this, this.referentiel);
  }

  vueAnnexePDFRisques() {
    return new ObjetPDFAnnexeRisques(this, this.referentiel);
  }

  actionRecommandee() {
    if (this.aUneSimulationMigrationReferentiel)
      return Service.ACTIONS_RECOMMANDEES.CONTINUER_SIMULATION_REFERENTIEL_V2;

    if (this.version() === VersionService.v1)
      return Service.ACTIONS_RECOMMANDEES.SIMULER_REFERENTIEL_V2;

    if (this.aUneSuggestionDAction())
      return Service.ACTIONS_RECOMMANDEES.METTRE_A_JOUR;

    const indiceCyber = this.indiceCyber().total;
    if (this.dossierCourant() && indiceCyber >= 4)
      return Service.ACTIONS_RECOMMANDEES.CONTINUER_HOMOLOGATION;

    if (this.dossierCourant() && indiceCyber < 4)
      return Service.ACTIONS_RECOMMANDEES.AUGMENTER_INDICE_CYBER;

    if (
      this.dossiers.aUnDossierEnCoursDeValidite() &&
      !this.dossiers.dossierActif()?.importe
    )
      return Service.ACTIONS_RECOMMANDEES.TELECHARGER_ENCART_HOMOLOGATION;

    if (this.dossiers.dossierActif()?.statutHomologation() === 'expiree')
      return Service.ACTIONS_RECOMMANDEES.HOMOLOGUER_A_NOUVEAU;

    const completude = this.completudeMesures();
    const pourcentageCompletude =
      completude.nombreMesuresCompletes / completude.nombreTotalMesures || 0;
    const nbContributeurs = this.contributeurs.length;
    if (nbContributeurs === 1 && pourcentageCompletude < 0.8 && indiceCyber < 4)
      return Service.ACTIONS_RECOMMANDEES.INVITER_CONTRIBUTEUR;

    if (nbContributeurs > 1 && pourcentageCompletude < 0.8 && indiceCyber < 4)
      return Service.ACTIONS_RECOMMANDEES.AUGMENTER_INDICE_CYBER;

    if (pourcentageCompletude >= 0.8 && indiceCyber >= 4)
      return Service.ACTIONS_RECOMMANDEES.HOMOLOGUER_SERVICE;

    return undefined;
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

  ajouteRisqueSpecifique(risque) {
    risque.identifiantNumerique = `RS${this.prochainIdNumeriqueDeRisqueSpecifique}`;
    this.prochainIdNumeriqueDeRisqueSpecifique += 1;
    this.risques.risquesSpecifiques.ajouteRisque(risque);
  }

  supprimeRisqueSpecifique(idRisque) {
    this.risques.risquesSpecifiques.supprimeRisque(idRisque);
  }

  metsAJourRisqueSpecifique(risque) {
    this.risques.risquesSpecifiques.metsAJourRisque(risque);
  }

  ajouteMesureSpecifique(mesure) {
    this.mesures.mesuresSpecifiques.ajouteMesure(mesure);
  }

  supprimeMesureSpecifique(idMesure) {
    this.mesures.mesuresSpecifiques.supprimeMesure(idMesure);
  }

  metsAJourMesureSpecifique(mesure) {
    const idContributeurs = this.contributeurs.map((u) => u.idUtilisateur);
    mesure.responsables = mesure.responsables.filter((r) =>
      idContributeurs.includes(r)
    );
    this.mesures.mesuresSpecifiques.metsAJourMesure(mesure);
  }

  estimeNiveauDeSecurite() {
    return this.descriptionService.estimeNiveauDeSecurite();
  }

  niveauSecuriteDepasseRecommandation() {
    return this.descriptionService.niveauSecuriteDepasseRecommandation();
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

    return new Service(donneesService);
  }

  static ACTIONS_RECOMMANDEES = ToutesActionsRecommandees;

  static valideDonneesCreation(donneesDescription, versionService) {
    const description =
      versionService === VersionService.v2
        ? DescriptionServiceV2
        : DescriptionService;

    description.valideDonneesCreation(donneesDescription);

    Entite.valideDonnees(donneesDescription.organisationResponsable);
  }
}

Object.assign(Service, NIVEAUX);

export default Service;
