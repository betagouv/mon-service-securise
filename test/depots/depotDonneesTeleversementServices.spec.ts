import {
  creeDepot,
  PersistanceTeleversementServices,
} from '../../src/depots/depotDonneesTeleversementServices.ts';
import { DepotDonneesTeleversementServices } from '../../src/depots/depotDonneesTeleversementServices.interface.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { unAdaptateurChiffrementQuiWrap } from '../mocks/adaptateurChiffrementQuiWrap.ts';
import { AdaptateurChiffrement } from '../../src/adaptateurs/adaptateurChiffrement.interface.ts';
import { creeReferentiel } from '../../src/referentiel.js';
import { Referentiel, ReferentielV2 } from '../../src/referentiel.interface.ts';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import TeleversementServicesV2 from '../../src/modeles/televersement/televersementServicesV2.ts';
import { creeReferentielV2 } from '../../src/referentielV2.ts';

describe('Le dépôt de données des téléversements de services', () => {
  let persistance: PersistanceTeleversementServices;
  let chiffrement: AdaptateurChiffrement;
  let referentiel: Referentiel;
  let referentielV2: ReferentielV2;
  let depot: DepotDonneesTeleversementServices;

  beforeEach(() => {
    chiffrement = unAdaptateurChiffrementQuiWrap();
    referentiel = creeReferentiel();
    referentielV2 = creeReferentielV2();
    persistance = unePersistanceMemoire(chiffrement).construis();

    depot = creeDepot({
      adaptateurPersistance: persistance,
      adaptateurChiffrement: chiffrement,
      referentiel,
      referentielV2,
    });
  });

  describe('sur lecture du pourcentage de progression', () => {
    it('calcule la progression à partir d\'un index "0-based"', async () => {
      const troisServices = [
        { nom: 'Mairie A', siret: '12345678912345' },
        { nom: 'Mairie B', siret: '12345678912345' },
        { nom: 'Mairie C', siret: '12345678912345' },
      ];
      await persistance.ajouteTeleversementServices(
        unUUID('2'),
        await chiffrement.chiffre(troisServices)
      );
      await depot.metsAJourProgressionTeleversement(unUUID('2'), 1);

      const pourcentage =
        await depot.lisPourcentageProgressionTeleversementServices(unUUID('2'));

      // Quand on a traité jusqu'à l'indice 1, avec 3 services, on est à 66 %.
      expect(pourcentage).toBe(66);
    });
  });

  describe("sur lecture du téléversement d'un utilisateur", () => {
    it("renvoie un téléversement V2 quand l'utilisateur a téléversé du V2", async () => {
      await persistance.ajouteTeleversementServices(
        unUUID('2'),
        await chiffrement.chiffre([
          { nom: 'Mairie A', siret: '12345678912345' },
        ])
      );

      const t = await depot.lisTeleversementServices(unUUID('2'));

      expect(t).toBeInstanceOf(TeleversementServicesV2);
    });
  });
});
