const expect = require('expect.js');

const AutorisationCreateur = require('../../../src/modeles/autorisations/autorisationCreateur');

describe("Une autorisation d'accès en tant que créateur", () => {
  it("permet d'ajouter un contributeur", () => {
    const autorisation = new AutorisationCreateur();
    expect(autorisation.permissionAjoutContributeur).to.be(true);
  });

  it('permet de supprimer un contributeur', () => {
    const autorisation = new AutorisationCreateur();
    expect(autorisation.permissionSuppressionContributeur).to.be(true);
  });

  it('permet de supprimer un service', () => {
    const autorisation = new AutorisationCreateur();
    expect(autorisation.permissionSuppressionService).to.be(true);
  });
});
