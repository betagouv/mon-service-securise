import { fabriqueAdaptateurGestionErreur } from '../../adaptateurs/fabriqueAdaptateurGestionErreur.js';

function metAJourContactsBrevoDesContributeurs({ crmBrevo, depotDonnees }) {
  return async ({ autorisations }) => {
    if (!autorisations) {
      throw new Error(
        "Impossible d'envoyer à Brevo le nombre de services des contributeurs sans avoir les autorisations en paramètre."
      );
    }

    const rapportExecution = await Promise.allSettled(
      autorisations.map(async (a) => {
        const utilisateur = await depotDonnees.utilisateur(a.idUtilisateur);
        const sesAutorisations = await depotDonnees.autorisations(
          utilisateur.id
        );
        await crmBrevo.metAJourNombresContributionsContact(
          utilisateur,
          sesAutorisations
        );
      })
    );

    rapportExecution
      .filter((r) => r.status === 'rejected')
      .forEach((r) =>
        fabriqueAdaptateurGestionErreur().logueErreur(new Error(r.reason))
      );
  };
}

export { metAJourContactsBrevoDesContributeurs };
