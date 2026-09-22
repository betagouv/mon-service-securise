import expect from 'expect.js';
import { aDesDonneesSuffisantes } from '../../src/adaptateurs/adaptateurProfilAnssi.js';

describe("L'adaptateur profil ANSSI", () => {
  describe('sur demande si les données de profil sont suffisantes', () => {
    it('répond non pour un invité', async () => {
      const resultat = aDesDonneesSuffisantes({ email: 'unInvite@mail.com' });

      expect(resultat).to.equal(false);
    });

    it('répond oui pour un utilisateur complet', async () => {
      const resultat = aDesDonneesSuffisantes({
        email: 'unInvite@mail.com',
        nom: 'Nom',
        prenom: 'Prenom',
        postes: ['Poste'],
        entite: { siret: '12345' },
      });

      expect(resultat).to.equal(true);
    });
  });
});
