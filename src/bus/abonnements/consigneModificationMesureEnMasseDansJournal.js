import { EvenementMesureModifieeEnMasse } from '../../modeles/journalMSS/evenementMesureModifieeEnMasse.js';

function consigneModificationMesureEnMasseDansJournal({ adaptateurJournal }) {
  return async ({
    type,
    idMesure,
    utilisateur,
    statutModifie,
    modalitesModifiees,
    nombreServicesConcernes,
  }) => {
    if (!utilisateur)
      throw new Error(
        `Impossible de consigner la mise à jour en masse d'une mesure sans avoir l'utilisateur en paramètre.`
      );

    const evenemementDuJournal = new EvenementMesureModifieeEnMasse({
      type,
      idMesure,
      statutModifie,
      modalitesModifiees,
      nombreServicesConcernes,
      idUtilisateur: utilisateur.id,
    });

    await adaptateurJournal.consigneEvenement(evenemementDuJournal.toJSON());
  };
}

export { consigneModificationMesureEnMasseDansJournal };
