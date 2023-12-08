const EvenementCompletudeServiceModifiee = require('../../../modeles/journalMSS/evenementCompletudeServiceModifiee');

function consigneDansJournal({ adaptateurJournal }) {
  return async (evenement) => {
    const { service } = evenement;

    const completude = new EvenementCompletudeServiceModifiee({
      idService: service.id,
      ...service.completudeMesures(),
      nombreOrganisationsUtilisatrices:
        service.descriptionService.nombreOrganisationsUtilisatrices,
    });

    await adaptateurJournal.consigneEvenement(completude.toJSON());
  };
}

module.exports = { consigneDansJournal };
