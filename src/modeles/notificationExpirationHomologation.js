import { ajouteMoisADate } from '../utilitaires/date.js';

class NotificationExpirationHomologation {
  constructor({ id, idService, dateProchainEnvoi, delaiAvantExpirationMois }) {
    if (id) this.id = id;
    this.idService = idService;
    this.dateProchainEnvoi = dateProchainEnvoi;
    this.delaiAvantExpirationMois = delaiAvantExpirationMois;
  }

  donneesAPersister() {
    return {
      idService: this.idService,
      dateProchainEnvoi: this.dateProchainEnvoi,
      delaiAvantExpirationMois: this.delaiAvantExpirationMois,
    };
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

export default NotificationExpirationHomologation;
