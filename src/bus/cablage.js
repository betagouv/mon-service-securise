import { EvenementAutorisationsServiceModifiees } from './evenementAutorisationsServiceModifiees.js';
import { consigneCompletudeDansJournal } from './abonnements/consigneCompletudeDansJournal.js';
import { envoieTrackingCompletude } from './abonnements/envoieTrackingDeCompletude.js';
import { EvenementNouveauServiceCree } from './evenementNouveauServiceCree.js';
import { consigneNouveauServiceDansJournal } from './abonnements/consigneNouveauServiceDansJournal.js';
import { envoieTrackingDeConnexionUtilisateur } from './abonnements/envoieTrackingDeConnexionUtilisateur.js';
import { envoieTrackingDeNouveauService } from './abonnements/envoieTrackingDeNouveauService.js';
import { consigneProprietaireCreeUnServiceDansJournal } from './abonnements/consigneProprietaireCreeUnServiceDansJournal.js';
import { consigneAutorisationsModifieesDansJournal } from './abonnements/consigneAutorisationsModifieesDansJournal.js';
import { EvenementDescriptionServiceModifiee } from './evenementDescriptionServiceModifiee.js';
import EvenementUtilisateurModifie from './evenementUtilisateurModifie.js';
import { consigneProfilUtilisateurModifieDansJournal } from './abonnements/consigneProfilUtilisateurModifieDansJournal.js';
import { consigneNouvelUtilisateurInscritDansJournal } from './abonnements/consigneNouvelUtilisateurInscritDansJournal.js';
import EvenementUtilisateurInscrit from './evenementUtilisateurInscrit.js';
import EvenementDossierHomologationFinalise from './evenementDossierHomologationFinalise.js';
import { consigneNouvelleHomologationCreeeDansJournal } from './abonnements/consigneNouvelleHomologationCreeeDansJournal.js';
import EvenementServiceSupprime from './evenementServiceSupprime.js';
import { consigneServiceSupprimeDansJournal } from './abonnements/consigneServiceSupprimeDansJournal.js';
import { sauvegardeNotificationsExpirationHomologation } from './abonnements/sauvegardeNotificationsExpirationHomologation.js';
import { supprimeNotificationsExpirationHomologation } from './abonnements/supprimeNotificationsExpirationHomologation.js';
import { envoieMailFelicitationHomologation } from './abonnements/envoieMailFelicitationHomologation.js';
import { relieEntrepriseEtContactBrevo } from './abonnements/relieEntrepriseEtContactBrevo.js';
import CrmBrevo from '../crm/crmBrevo.js';
import { modifieLienEntrepriseEtContactBrevo } from './abonnements/modifieLienEntrepriseEtContactBrevo.js';
import { metAJourContactBrevoDuContributeur } from './abonnements/metAJourContactBrevoDuContributeur.js';
import { metAJourContactsBrevoDesContributeurs } from './abonnements/metAJourContactsBrevoDesContributeurs.js';
import { metAJourEstimationNombreServicesContactBrevo } from './abonnements/metAJourEstimationNombreServicesContactBrevo.js';
import { metAJourContactBrevoDeLUtilisateur } from './abonnements/metAJourContactBrevoDeLUtilisateur.js';
import { supprimeSuggestionsSurDesChampsObligatoires } from './abonnements/supprimeSuggestionsSurDesChampsObligatoires.js';
import EvenementMesureServiceModifiee from './evenementMesureServiceModifiee.js';
import { consigneActiviteMesure } from './abonnements/consigneActiviteMesure.js';
import EvenementMesureServiceSupprimee from './evenementMesureServiceSupprimee.js';
import { consigneConnexionUtilisateurDansJournal } from './abonnements/consigneConnexionUtilisateurDansJournal.js';
import EvenementNouvelleConnexionUtilisateur from './evenementNouvelleConnexionUtilisateur.js';
import { sauvegardeEvolutionIndiceCyber } from './abonnements/sauvegardeEvolutionIndiceCyber.js';
import EvenementRisqueServiceModifie from './evenementRisqueServiceModifie.js';
import { consigneRisquesDansJournal } from './abonnements/consigneRisquesDansJournal.js';
import { relieServiceEtSuperviseurs } from './abonnements/relieServiceEtSuperviseurs.js';
import { delieServiceEtSuperviseurs } from './abonnements/delieServiceEtSuperviseurs.js';
import ServiceSupervision from '../supervision/serviceSupervision.js';
import { modifieLienServiceEtSuperviseurs } from './abonnements/modifieLienServiceEtSuperviseurs.js';
import EvenementInvitationUtilisateurEnvoyee from './evenementInvitationUtilisateurEnvoyee.js';
import { consigneNouveauParrainage } from './abonnements/consigneNouveauParrainage.js';
import { metAJourParrainage } from './abonnements/metAJourParrainage.js';
import EvenementDossierHomologationImporte from './evenementDossierHomologationImporte.js';
import EvenementServicesImportes from './evenementServicesImportes.js';
import { consigneTeleversementServicesRealiseDansJournal } from './abonnements/consigneTeleversementServicesRealiseDansJournal.js';
import { supprimeSuggestionsActions } from './abonnements/supprimeSuggestionsActions.js';
import EvenementMesureModifieeEnMasse from './evenementMesureModifieeEnMasse.js';
import { consigneModificationMesureEnMasseDansJournal } from './abonnements/consigneModificationMesureEnMasseDansJournal.js';
import EvenementModelesMesureSpecifiqueImportes from './evenementModelesMesureSpecifiqueImportes.js';
import { consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal } from './abonnements/consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal.js';
import { EvenementServiceRattacheAPrestataire } from './evenementServiceRattacheAPrestataire.js';
import { consigneRattachementDeServiceAPrestataireDansJournal } from './abonnements/consigneRattachementDeServiceAPrestataireDansJournal.js';
import { EvenementCguAccepteesParUtilisateur } from './evenementCguAccepteesParUtilisateur.js';
import { consigneAcceptationCguDansJournal } from './abonnements/consigneAcceptationCguDansJournal.js';
import { consigneServiceV1MigreEnV2 } from './abonnements/consigneServiceV1MigreEnV2DansJournal.js';
import EvenementServiceV1MigreEnV2 from './evenementServiceV1MigreEnV2.js';
import EvenementSimulationMigrationReferentielCreee from './evenementSimulationMigrationReferentielCreee.js';
import { consigneSimulationMigrationReferentielCreee } from './abonnements/consigneSimulationMigrationReferentielCreeeDansJournal.js';

const cableTousLesAbonnes = (
  busEvenements,
  {
    adaptateurHorloge,
    adaptateurTracking,
    adaptateurJournal,
    adaptateurRechercheEntreprise,
    adaptateurMail,
    adaptateurSupervision,
    depotDonnees,
    referentiel,
  }
) => {
  const crmBrevo = new CrmBrevo({
    adaptateurRechercheEntreprise,
    adaptateurMail,
  });
  const serviceSupervision = new ServiceSupervision({
    adaptateurSupervision,
    depotDonnees,
  });

  busEvenements.abonnePlusieurs(EvenementNouveauServiceCree, [
    consigneNouveauServiceDansJournal({ adaptateurJournal }),
    consigneProprietaireCreeUnServiceDansJournal({ adaptateurJournal }),
    envoieTrackingDeNouveauService({ adaptateurTracking, depotDonnees }),
    consigneCompletudeDansJournal({
      adaptateurJournal,
    }),
    envoieTrackingCompletude({ adaptateurTracking, depotDonnees }),
    metAJourContactBrevoDuContributeur({
      crmBrevo,
      depotDonnees,
    }),
    relieServiceEtSuperviseurs({ serviceSupervision }),
  ]);

  busEvenements.abonne(
    EvenementMesureModifieeEnMasse,
    consigneModificationMesureEnMasseDansJournal({ adaptateurJournal })
  );

  busEvenements.abonnePlusieurs(EvenementMesureServiceModifiee, [
    consigneCompletudeDansJournal({
      adaptateurJournal,
    }),
    envoieTrackingCompletude({ adaptateurTracking, depotDonnees }),
    consigneActiviteMesure({ depotDonnees }),
    sauvegardeEvolutionIndiceCyber({ depotDonnees }),
  ]);

  busEvenements.abonnePlusieurs(EvenementMesureServiceSupprimee, [
    consigneCompletudeDansJournal({
      adaptateurJournal,
    }),
    envoieTrackingCompletude({ adaptateurTracking, depotDonnees }),
  ]);

  busEvenements.abonne(
    EvenementRisqueServiceModifie,
    consigneRisquesDansJournal({ adaptateurJournal })
  );

  busEvenements.abonnePlusieurs(EvenementDescriptionServiceModifiee, [
    supprimeSuggestionsSurDesChampsObligatoires({ depotDonnees }),
    consigneCompletudeDansJournal({
      adaptateurJournal,
    }),
    envoieTrackingCompletude({ adaptateurTracking, depotDonnees }),
    modifieLienServiceEtSuperviseurs({ serviceSupervision }),
  ]);

  busEvenements.abonnePlusieurs(EvenementAutorisationsServiceModifiees, [
    consigneAutorisationsModifieesDansJournal({ adaptateurJournal }),
    metAJourContactsBrevoDesContributeurs({ crmBrevo, depotDonnees }),
  ]);

  busEvenements.abonnePlusieurs(EvenementUtilisateurModifie, [
    consigneProfilUtilisateurModifieDansJournal({
      adaptateurJournal,
    }),
    modifieLienEntrepriseEtContactBrevo({ crmBrevo }),
    metAJourEstimationNombreServicesContactBrevo({ crmBrevo }),
    metAJourContactBrevoDeLUtilisateur({ crmBrevo }),
    metAJourParrainage({ depotDonnees }),
  ]);

  busEvenements.abonnePlusieurs(EvenementUtilisateurInscrit, [
    consigneNouvelUtilisateurInscritDansJournal({ adaptateurJournal }),
    consigneProfilUtilisateurModifieDansJournal({
      adaptateurJournal,
    }),
    relieEntrepriseEtContactBrevo({ crmBrevo }),
    metAJourEstimationNombreServicesContactBrevo({ crmBrevo }),
  ]);

  busEvenements.abonne(
    EvenementInvitationUtilisateurEnvoyee,
    consigneNouveauParrainage({ depotDonnees })
  );

  busEvenements.abonnePlusieurs(EvenementNouvelleConnexionUtilisateur, [
    consigneConnexionUtilisateurDansJournal({ adaptateurJournal }),
    envoieTrackingDeConnexionUtilisateur({ adaptateurTracking, depotDonnees }),
  ]);

  busEvenements.abonnePlusieurs(EvenementDossierHomologationFinalise, [
    consigneNouvelleHomologationCreeeDansJournal({
      adaptateurJournal,
      referentiel,
    }),
    sauvegardeNotificationsExpirationHomologation({
      adaptateurHorloge,
      depotDonnees,
      referentiel,
    }),
    envoieMailFelicitationHomologation({ depotDonnees, adaptateurMail }),
  ]);

  busEvenements.abonnePlusieurs(EvenementDossierHomologationImporte, [
    consigneNouvelleHomologationCreeeDansJournal({
      adaptateurJournal,
      referentiel,
    }),
    sauvegardeNotificationsExpirationHomologation({
      adaptateurHorloge,
      depotDonnees,
      referentiel,
    }),
  ]);

  busEvenements.abonnePlusieurs(EvenementServiceSupprime, [
    consigneServiceSupprimeDansJournal({ adaptateurJournal }),
    supprimeNotificationsExpirationHomologation({ depotDonnees }),
    metAJourContactsBrevoDesContributeurs({ crmBrevo, depotDonnees }),
    delieServiceEtSuperviseurs({ serviceSupervision }),
    supprimeSuggestionsActions({ depotDonnees }),
  ]);

  busEvenements.abonne(
    EvenementServicesImportes,
    consigneTeleversementServicesRealiseDansJournal({ adaptateurJournal })
  );

  busEvenements.abonne(
    EvenementModelesMesureSpecifiqueImportes,
    consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal({
      adaptateurJournal,
    })
  );

  busEvenements.abonne(
    EvenementServiceRattacheAPrestataire,
    consigneRattachementDeServiceAPrestataireDansJournal({ adaptateurJournal })
  );

  busEvenements.abonne(
    EvenementCguAccepteesParUtilisateur,
    consigneAcceptationCguDansJournal({ adaptateurJournal })
  );

  busEvenements.abonnePlusieurs(EvenementServiceV1MigreEnV2, [
    consigneServiceV1MigreEnV2({ adaptateurJournal }),
    consigneCompletudeDansJournal({ adaptateurJournal }),
  ]);

  busEvenements.abonne(
    EvenementSimulationMigrationReferentielCreee,
    consigneSimulationMigrationReferentielCreee({ adaptateurJournal })
  );
};

export { cableTousLesAbonnes };
