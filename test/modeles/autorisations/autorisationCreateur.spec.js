const expect = require('expect.js');

const AutorisationCreateur = require('../../../src/modeles/autorisations/autorisationCreateur');

describe("Une autorisation d'accès en tant que créateur", () => {
  it("permet d'ajouter un contributeur", () => {
    const autorisation = new AutorisationCreateur();
    expect(autorisation.permissionAjoutContributeur).to.be(true);
  });
});
