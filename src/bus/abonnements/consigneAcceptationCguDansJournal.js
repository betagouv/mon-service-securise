import EvenementCGUAcceptees from '../../modeles/journalMSS/evenementCguAcceptees.js';

function consigneAcceptationCguDansJournal({ adaptateurJournal }) {
  return async ({ idUtilisateur, cguAcceptees }) => {
    const profilUtilisateurModifie = new EvenementCGUAcceptees({
      idUtilisateur,
      cguAcceptees,
    });

    await adaptateurJournal.consigneEvenement(
      profilUtilisateurModifie.toJSON()
    );
  };
}

export { consigneAcceptationCguDansJournal };
