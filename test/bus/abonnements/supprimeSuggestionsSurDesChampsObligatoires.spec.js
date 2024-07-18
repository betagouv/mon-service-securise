const expect = require('expect.js');
const {
  supprimeSuggestionsSurDesChampsObligatoires,
} = require('../../../src/bus/abonnements/supprimeSuggestionsSurDesChampsObligatoires');
const { unService } = require('../../constructeurs/constructeurService');

describe('L’abonnement qui supprime les suggestions portant sur des données obligatoires', () => {
  it('utilise le dépôt pour supprimer la suggestion de mise à jour du SIRET', async () => {
    let idServiceAcquitte;
    const depotDonnees = {
      acquitteSuggestionAction: (idService, nature) => {
        if (nature === 'miseAJourSiret') idServiceAcquitte = idService;
      },
    };

    const abonne = supprimeSuggestionsSurDesChampsObligatoires({
      depotDonnees,
    });

    expect(abonne).to.be.an('function');
    await abonne({
      service: unService().avecId('S1').construis(),
    });
    expect(idServiceAcquitte).to.be('S1');
  });

  it('utilise le dépôt pour supprimer la suggestion de mise à jour des organisations utilisatrices', async () => {
    let idServiceAcquitte;
    const depotDonnees = {
      acquitteSuggestionAction: (idService, nature) => {
        if (nature === 'miseAJourNombreOrganisationsUtilisatrices')
          idServiceAcquitte = idService;
      },
    };

    await supprimeSuggestionsSurDesChampsObligatoires({
      depotDonnees,
    })({ service: unService().avecId('S1').construis() });

    expect(idServiceAcquitte).to.be('S1');
  });
});
