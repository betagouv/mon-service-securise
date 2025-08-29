import EvenementServicesImportes from '../../modeles/journalMSS/evenementServicesImportes.js';

function consigneTeleversementServicesRealiseDansJournal({
  adaptateurJournal,
}) {
  return async ({ idUtilisateur, nbServicesImportes }) => {
    if (!idUtilisateur)
      throw new Error(
        "Impossible de consigner la réalisation d'un téléversement de services sans avoir l'identifiant de l'utilisateur en paramètre."
      );

    if (!nbServicesImportes)
      throw new Error(
        "Impossible de consigner la réalisation d'un téléversement de services sans avoir le nombre de services importés en paramètre."
      );

    const servicesImportes = new EvenementServicesImportes({
      idUtilisateur,
      nbServicesImportes,
    });

    await adaptateurJournal.consigneEvenement(servicesImportes.toJSON());
  };
}

export { consigneTeleversementServicesRealiseDansJournal };
