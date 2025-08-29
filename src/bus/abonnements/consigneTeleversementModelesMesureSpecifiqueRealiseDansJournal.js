import EvenementModelesMesureSpecifiqueImportes from '../../modeles/journalMSS/evenementModelesMesureSpecifiqueImportes.js';

function consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal({
  adaptateurJournal,
}) {
  return async ({ idUtilisateur, nbModelesMesureSpecifiqueImportes }) => {
    if (!idUtilisateur)
      throw new Error(
        "Impossible de consigner la réalisation d'un téléversement de modèles de mesure spécifique sans avoir l'identifiant de l'utilisateur en paramètre."
      );

    if (!nbModelesMesureSpecifiqueImportes)
      throw new Error(
        "Impossible de consigner la réalisation d'un téléversement de modèles de mesure spécifique sans avoir le nombre de modèles de mesure spécifique importés en paramètre."
      );

    const modelesImportes = new EvenementModelesMesureSpecifiqueImportes({
      idUtilisateur,
      nbModelesMesureSpecifiqueImportes,
    });

    await adaptateurJournal.consigneEvenement(modelesImportes.toJSON());
  };
}

export { consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal };
