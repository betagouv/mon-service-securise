const EvenementCompletudeServiceModifiee = require('../../modeles/journalMSS/evenementCompletudeServiceModifiee');

const leveException = (raison) => {
  throw new Error(
    `Impossible de consigner la complétude dans le journal MSS sans avoir le ${raison} en paramètre.`
  );
};

function consigneCompletudeDansJournal({
  adaptateurJournal,
  adaptateurRechercheEntreprise,
}) {
  return async (evenement) => {
    const { service } = evenement;

    if (!service) leveException('service');

    let organisationResponsable = {};
    const { siret } = service.descriptionService.organisationResponsable;
    if (siret) {
      organisationResponsable =
        await adaptateurRechercheEntreprise.recupereDetailsOrganisation(siret);
    }

    const completude = new EvenementCompletudeServiceModifiee({
      service,
      organisationResponsable,
    });

    await adaptateurJournal.consigneEvenement(completude.toJSON());
  };
}

module.exports = { consigneCompletudeDansJournal };
