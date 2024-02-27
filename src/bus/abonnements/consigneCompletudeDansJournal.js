const EvenementCompletudeServiceModifiee = require('../../modeles/journalMSS/evenementCompletudeServiceModifiee');

const leveException = (raison) => {
  throw new Error(
    `Impossible de consigner la complétude dans le journal MSS sans avoir le ${raison} en paramètre.`
  );
};

function consigneCompletudeDansJournal({ adaptateurJournal }) {
  return async (evenement) => {
    const { service } = evenement;

    if (!service) leveException('service');

    const completude = new EvenementCompletudeServiceModifiee({
      idService: service.id,
      ...service.completudeMesures(),
      nombreOrganisationsUtilisatrices:
        service.descriptionService.nombreOrganisationsUtilisatrices,
    });

    await adaptateurJournal.consigneEvenement(completude.toJSON());
  };
}

module.exports = { consigneCompletudeDansJournal };
