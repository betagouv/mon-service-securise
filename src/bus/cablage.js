const {
  EvenementAutorisationsServiceModifiees,
} = require('./evenementAutorisationsServiceModifiees');
const {
  consigneCompletudeDansJournal,
} = require('./abonnements/consigneCompletudeDansJournal');
const {
  envoieTrackingCompletude,
} = require('./abonnements/envoieTrackingDeCompletude');
const EvenementNouveauServiceCree = require('./evenementNouveauServiceCree');
const {
  consigneNouveauServiceDansJournal,
} = require('./abonnements/consigneNouveauServiceDansJournal');
const {
  envoieTrackingDeConnexionUtilisateur,
} = require('./abonnements/envoieTrackingDeConnexionUtilisateur');
const {
  envoieTrackingDeNouveauService,
} = require('./abonnements/envoieTrackingDeNouveauService');
const {
  consigneProprietaireCreeUnServiceDansJournal,
} = require('./abonnements/consigneProprietaireCreeUnServiceDansJournal');
const {
  consigneAutorisationsModifieesDansJournal,
} = require('./abonnements/consigneAutorisationsModifieesDansJournal');
const {
  EvenementDescriptionServiceModifiee,
} = require('./evenementDescriptionServiceModifiee');
const EvenementUtilisateurModifie = require('./evenementUtilisateurModifie');
const {
  consigneProfilUtilisateurModifieDansJournal,
} = require('./abonnements/consigneProfilUtilisateurModifieDansJournal');
const {
  consigneNouvelUtilisateurInscritDansJournal,
} = require('./abonnements/consigneNouvelUtilisateurInscritDansJournal');
const EvenementUtilisateurInscrit = require('./evenementUtilisateurInscrit');
const EvenementDossierHomologationFinalise = require('./evenementDossierHomologationFinalise');
const {
  consigneNouvelleHomologationCreeeDansJournal,
} = require('./abonnements/consigneNouvelleHomologationCreeeDansJournal');
const EvenementServiceSupprime = require('./evenementServiceSupprime');
const {
  consigneServiceSupprimeDansJournal,
} = require('./abonnements/consigneServiceSupprimeDansJournal');
const {
  sauvegardeNotificationsExpirationHomologation,
} = require('./abonnements/sauvegardeNotificationsExpirationHomologation');
const {
  supprimeNotificationsExpirationHomologation,
} = require('./abonnements/supprimeNotificationsExpirationHomologation');
const {
  envoieMailFelicitationHomologation,
} = require('./abonnements/envoieMailFelicitationHomologation');
const {
  relieEntrepriseEtContactBrevo,
} = require('./abonnements/relieEntrepriseEtContactBrevo');
const CrmBrevo = require('../crm/crmBrevo');
const {
  modifieLienEntrepriseEtContactBrevo,
} = require('./abonnements/modifieLienEntrepriseEtContactBrevo');
const {
  metAJourContactBrevoDuContributeur,
} = require('./abonnements/metAJourContactBrevoDuContributeur');
const {
  metAJourContactsBrevoDesContributeurs,
} = require('./abonnements/metAJourContactsBrevoDesContributeurs');
const {
  metAJourEstimationNombreServicesContactBrevo,
} = require('./abonnements/metAJourEstimationNombreServicesContactBrevo');
const {
  metAJourContactBrevoDeLUtilisateur,
} = require('./abonnements/metAJourContactBrevoDeLUtilisateur');
const {
  supprimeSuggestionsSurDesChampsObligatoires,
} = require('./abonnements/supprimeSuggestionsSurDesChampsObligatoires');
const EvenementMesureServiceModifiee = require('./evenementMesureServiceModifiee');
const {
  consigneActiviteMesure,
} = require('./abonnements/consigneActiviteMesure');
const EvenementMesureServiceSupprimee = require('./evenementMesureServiceSupprimee');
const {
  consigneConnexionUtilisateurDansJournal,
} = require('./abonnements/consigneConnexionUtilisateurDansJournal');
const EvenementNouvelleConnexionUtilisateur = require('./evenementNouvelleConnexionUtilisateur');
const {
  sauvegardeEvolutionIndiceCyber,
} = require('./abonnements/sauvegardeEvolutionIndiceCyber');
const EvenementRisqueServiceModifie = require('./evenementRisqueServiceModifie');
const {
  consigneRisquesDansJournal,
} = require('./abonnements/consigneRisquesDansJournal');
const {
  relieServiceEtSuperviseurs,
} = require('./abonnements/relieServiceEtSuperviseurs');
const {
  delieServiceEtSuperviseurs,
} = require('./abonnements/delieServiceEtSuperviseurs');
const ServiceSupervision = require('../supervision/serviceSupervision');
const {
  modifieLienServiceEtSuperviseurs,
} = require('./abonnements/modifieLienServiceEtSuperviseurs');
const EvenementInvitationUtilisateurEnvoyee = require('./evenementInvitationUtilisateurEnvoyee');
const {
  consigneNouveauParrainage,
} = require('./abonnements/consigneNouveauParrainage');
const { metAJourParrainage } = require('./abonnements/metAJourParrainage');
const EvenementDossierHomologationImporte = require('./evenementDossierHomologationImporte');
const EvenementServicesImportes = require('./evenementServicesImportes');
const {
  consigneTeleversementServicesRealiseDansJournal,
} = require('./abonnements/consigneTeleversementServicesRealiseDansJournal');
const {
  supprimeSuggestionsActions,
} = require('./abonnements/supprimeSuggestionsActions');
const EvenementMesureModifieeEnMasse = require('./evenementMesureModifieeEnMasse');
const {
  consigneModificationMesureEnMasseDansJournal,
} = require('./abonnements/consigneModificationMesureEnMasseDansJournal');
const EvenementModelesMesureSpecifiqueImportes = require('./evenementModelesMesureSpecifiqueImportes');
const {
  consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal,
} = require('./abonnements/consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal');
const {
  EvenementServiceRattacheAPrestataire,
} = require('./evenementServiceRattacheAPrestataire');
const {
  consigneRattachementDeServiceAPrestataireDansJournal,
} = require('./abonnements/consigneRattachementDeServiceAPrestataireDansJournal');

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
};

module.exports = { cableTousLesAbonnes };
