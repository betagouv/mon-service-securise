import expect from 'expect.js';
import { depotVide } from './depots/depotVide.js';

describe('Le dépôt de données vide', () => {
  it('ne retourne aucun service pour un utilisateur donné', async () => {
    const depot = await depotVide();
    const services = await depot.services('456');
    expect(services).to.eql([]);
  });

  it('ne retourne rien si on cherche un service à partir de son identifiant', async () => {
    const depot = await depotVide();
    const s = await depot.service('123');
    expect(s).to.be(undefined);
  });

  it('ne retourne rien si on cherche un utilisateur à partir de son identifiant', async () => {
    const depot = await depotVide();
    const u = await depot.utilisateur('456');
    expect(u).to.be(undefined);
  });

  it("n'authentifie pas l'utilisateur", async () => {
    const depot = await depotVide();

    const utilisateur = await depot.utilisateurAuthentifie(
      'jean.dupont@mail.fr',
      'mdp_12345'
    );

    expect(utilisateur).to.be(undefined);
  });
});
