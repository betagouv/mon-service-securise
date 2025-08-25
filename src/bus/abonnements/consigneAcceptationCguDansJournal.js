const EvenementCGUAcceptees = require('../../modeles/journalMSS/evenementCguAcceptees');

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

module.exports = { consigneAcceptationCguDansJournal };
