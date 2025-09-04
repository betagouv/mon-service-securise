import { DonneesChiffrees, UUID } from '../../src/typesBasiques.ts';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import * as DepotDonneesBrouillonService from '../../src/depots/depotDonneesBrouillonService.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import { BrouillonService } from '../../src/depots/depotDonneesBrouillonService.ts';

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

  describe("sur demande de récupération des brouillons d'un utilisateur", () => {
    it('délègue à la persistance la lecture des brouillons', async () => {
      let idRecu: UUID | null = null;
      const persistance = unePersistanceMemoire().construis();
      const adaptateurChiffrement = fauxAdaptateurChiffrement();
      persistance.lisBrouillonsService = async (idUtilisateur: UUID) => {
        idRecu = idUtilisateur;
        return [{ donnees: { nomService: 'nom du service' }, id: unUUID('b') }];
      };
      const depotDonnees = DepotDonneesBrouillonService.creeDepot({
        persistance,
        adaptateurUUID: { genereUUID: () => unUUID('b') },
        adaptateurChiffrement,
      });

      const brouillons = await depotDonnees.lisBrouillonsService(unUUID('2'));

      expect(idRecu).toBe(unUUID('2'));
      expect(brouillons.length).toBe(1);
    });

    it('déchiffre les données du brouillon', async () => {
      const persistance = unePersistanceMemoire().construis();
      const adaptateurChiffrement = fauxAdaptateurChiffrement();
      adaptateurChiffrement.dechiffre = async (
        donneesBrouillon: BrouillonService
      ) => ({ nomService: `${donneesBrouillon.nomService}-dechiffre` });
      persistance.lisBrouillonsService = async (_: UUID) => [
        {
          donnees: {
            nomService: 'nom du service',
          },
          id: unUUID('b'),
        },
      ];
      const depotDonnees = DepotDonneesBrouillonService.creeDepot({
        persistance,
        adaptateurUUID: { genereUUID: () => unUUID('b') },
        adaptateurChiffrement,
      });

      const brouillons = await depotDonnees.lisBrouillonsService(unUUID('2'));

      expect(brouillons[0].nomService).toBe('nom du service-dechiffre');
    });
  });
});
