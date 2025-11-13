import {
  creeDepot,
  PersistanceTeleversementServices,
} from '../../src/depots/depotDonneesTeleversementServices.ts';
import { DepotDonneesTeleversementServices } from '../../src/depots/depotDonneesTeleversementServices.interface.ts';
import { UUID } from '../../src/typesBasiques.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { unAdaptateurChiffrementQuiWrap } from '../mocks/adaptateurChiffrementQuiWrap.ts';
import { AdaptateurChiffrement } from '../../src/adaptateurs/adaptateurChiffrement.interface.ts';
import { creeReferentiel } from '../../src/referentiel.js';
import { Referentiel } from '../../src/referentiel.interface.ts';

const donneesServiceValide = {};

describe('Le dépôt de données des téléversements de services', () => {
  let adaptateurPersistance: PersistanceTeleversementServices;
  let chiffrement: AdaptateurChiffrement;
  let referentiel: Referentiel;
  let depot: DepotDonneesTeleversementServices;

  beforeEach(() => {
    chiffrement = unAdaptateurChiffrementQuiWrap();
    referentiel = creeReferentiel();
    adaptateurPersistance = {
      ajouteTeleversementServices: async (): Promise<UUID> => unUUID('9'),
      metsAJourProgressionTeleversement: async () => {},
      supprimeTeleversementServices: async () => {},
      lisTeleversementServices: async (idUtilisateur: UUID) => {
        if (idUtilisateur !== unUUID('2')) return undefined;

        const services = await chiffrement.chiffre([
          donneesServiceValide,
          donneesServiceValide,
          donneesServiceValide,
        ]);
        return { donnees: { services } };
      },
      lisProgressionTeleversementServices: async (idUtilisateur: UUID) => {
        if (idUtilisateur !== unUUID('2'))
          throw new Error(
            `La persistance du test ne répond que pour ${unUUID('2')})`
          );

        return { progression: 1 };
      },
    };

    depot = creeDepot({
      adaptateurPersistance,
      adaptateurChiffrement: chiffrement,
      referentiel,
    });
  });

  describe('sur lecture du pourcentage de progression', () => {
    it('retourne le pourcentage', async () => {
      const pourcentage =
        await depot.lisPourcentageProgressionTeleversementServices(unUUID('2'));

      expect(pourcentage).toBe(66);
    });
  });
});
