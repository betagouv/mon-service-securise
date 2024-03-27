const { ajouteMoisADate } = require('../utilitaires/date');

class NotificationExpirationHomologation {
  constructor({ idService, dateProchainEnvoi, delaiAvantExpirationMois }) {
    this.idService = idService;
    this.dateProchainEnvoi = dateProchainEnvoi;
    this.delaiAvantExpirationMois = delaiAvantExpirationMois;
  }

  static pourUnDossier({ idService, dossier, referentiel }) {
    const idEcheance = dossier.decision.dureeValidite;
    const nbMoisExpiration = referentiel.nbMoisDecalage(idEcheance);

    const notificationsExpiration = referentiel
      .nbMoisRappelsExpiration(idEcheance)
      .map(
        (delai) =>
          new NotificationExpirationHomologation({
            idService,
            dateProchainEnvoi: ajouteMoisADate(
              nbMoisExpiration - delai,
              `${dossier.decision.dateHomologation}T00:00:00Z`
            ),
            delaiAvantExpirationMois: delai,
          })
      );
    const notificationDerniereEcheance = new NotificationExpirationHomologation(
      {
        idService,
        dateProchainEnvoi: dossier.dateProchaineHomologation(),
        delaiAvantExpirationMois: 0,
      }
    );
    return [...notificationsExpiration, notificationDerniereEcheance];
  }
}

module.exports = NotificationExpirationHomologation;
