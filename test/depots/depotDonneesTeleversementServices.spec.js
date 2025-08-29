import expect from 'expect.js';
import * as DepotDonneesTeleversementServices from '../../src/depots/depotDonneesTeleversementServices.js';

const donneesServiceValide = {};

describe('Le dépôt de données des téléversements de services', () => {
  let adaptateurPersistance;
  let adaptateurChiffrement;
  let depot;

  beforeEach(() => {
    adaptateurChiffrement = {
      dechiffre: (donnees) => donnees,
    };
    adaptateurPersistance = {
      lisTeleversementServices: (idUtilisateur) => {
        if (idUtilisateur === 'U1')
          return {
            donnees: {
              services: [
                donneesServiceValide,
                donneesServiceValide,
                donneesServiceValide,
              ],
            },
          };
        return undefined;
      },
      lisProgressionTeleversementServices: (idUtilisateur) => {
        if (idUtilisateur === 'U1') return { progression: 1 };
        return undefined;
      },
    };
    depot = DepotDonneesTeleversementServices.creeDepot({
      adaptateurPersistance,
      adaptateurChiffrement,
    });
  });

  describe('sur lecture du pourcentage de progression', () => {
    it('retourne le pourcentage', async () => {
      const pourcentage =
        await depot.lisPourcentageProgressionTeleversementServices('U1');

      expect(pourcentage).to.be(66);
    });
  });
});
