import EvenementNouvelleHomologationCreee from '../../modeles/journalMSS/evenementNouvelleHomologationCreee.js';

function consigneNouvelleHomologationCreeeDansJournal({
  adaptateurJournal,
  referentiel,
}) {
  return async ({ idService, dossier, importe }) => {
    if (!idService)
      throw new Error(
        "Impossible de consigner la finalisation d'un dossier d'homologation sans avoir l'ID du service en paramètre."
      );

    if (!dossier)
      throw new Error(
        "Impossible de consigner la finalisation d'un dossier d'homologation sans avoir le dossier en paramètre."
      );

    const nouvelleHomologationCreee = new EvenementNouvelleHomologationCreee({
      idService,
      dateHomologation: dossier.decision.dateHomologation,
      dureeHomologationMois: referentiel.nbMoisDecalage(
        dossier.decision.dureeValidite
      ),
      importe,
    });

    await adaptateurJournal.consigneEvenement(
      nouvelleHomologationCreee.toJSON()
    );
  };
}

export { consigneNouvelleHomologationCreeeDansJournal };
