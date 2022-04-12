const expect = require('expect.js');

const AutorisationBase = require('../../../src/modeles/autorisations/autorisationBase');

describe('Une autorisation de base', () => {
  it("ne permet pas d'ajouter un contributeur", () => {
    const autorisation = new AutorisationBase();
    expect(autorisation.permissionAjoutContributeur).to.be(false);
  });

  it('ne permet pas de supprimer un contributeur', () => {
    const autorisation = new AutorisationBase();
    expect(autorisation.permissionSuppressionContributeur).to.be(false);
  });
});
