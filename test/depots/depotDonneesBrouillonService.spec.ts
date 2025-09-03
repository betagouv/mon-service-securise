import { DonneesChiffrees, UUID } from '../../src/typesBasiques.ts';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import * as DepotDonneesBrouillonService from '../../src/depots/depotDonneesBrouillonService.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';

describe('Le dépôt de données des brouillons de Service', () => {
  describe('sur demande de création de nouveau brouillon de service', () => {
    it('délègue à la persistance la sauvegarde du brouillon', async () => {
      let donneesPersistees;
      const persistance = unePersistanceMemoire().construis();
      const adaptateurChiffrement = fauxAdaptateurChiffrement();

      persistance.ajouteBrouillonService = async (
        id: UUID,
        idUtilisateur: UUID,
        brouillon: { nomService: string }
      ) => {
        donneesPersistees = { id, idUtilisateur, brouillon };
      };

      const depotDonnees = DepotDonneesBrouillonService.creeDepot({
        persistance,
        adaptateurUUID: { genereUUID: () => unUUID('b') },
        adaptateurChiffrement,
      });

      const idCree = await depotDonnees.nouveauBrouillonService(
        unUUID('2'),
        'Nom du brouillon'
      );

      expect(donneesPersistees).toEqual({
        idUtilisateur: unUUID('2'),
        id: unUUID('b'),
        brouillon: { nomService: 'Nom du brouillon' },
      });
      expect(idCree).toBe(unUUID('b'));
    });

    it('chiffre les données du brouillon', async () => {
      const persistance = unePersistanceMemoire().construis();
      const adaptateurChiffrement = fauxAdaptateurChiffrement();
      adaptateurChiffrement.chiffre = async (donnees) => ({
        ...donnees,
        chiffre: true,
      });

      let donneesPersistees;
      persistance.ajouteBrouillonService = async (
        id: UUID,
        idUtilisateur: UUID,
        brouillon: DonneesChiffrees
      ) => {
        donneesPersistees = { id, idUtilisateur, brouillon };
      };

      const depotDonnees = DepotDonneesBrouillonService.creeDepot({
        persistance,
        adaptateurUUID: { genereUUID: () => unUUID('b') },
        adaptateurChiffrement,
      });

      await depotDonnees.nouveauBrouillonService(
        unUUID('2'),
        'Nom du brouillon'
      );

      expect(donneesPersistees!.brouillon.chiffre).toBe(true);
    });
  });
});
