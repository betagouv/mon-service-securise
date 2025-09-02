import { UUID } from '../../src/typesBasiques.ts';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import * as DepotDonneesBrouillonService from '../../src/depots/depotDonneesBrouillonService.ts';
import { unUUID } from '../constructeurs/UUID.ts';

describe('Le dépôt de données des brouillons de Service', () => {
  describe('sur demande de création de nouveau brouillon de service', () => {
    it('délègue à la persistance la sauvegarde du brouillon', async () => {
      let donneesPersistees;
      const persistance = unePersistanceMemoire().construis();

      persistance.ajouteBrouillonService = async (
        idUtilisateur: UUID,
        brouillon: { id: UUID; nomService: string }
      ) => {
        donneesPersistees = { idUtilisateur, brouillon };
      };

      const depotDonnees = DepotDonneesBrouillonService.creeDepot({
        persistance,
        adaptateurUUID: { genereUUID: () => unUUID('b') },
      });

      await depotDonnees.nouveauBrouillonService(
        unUUID('2'),
        'Nom du brouillon'
      );

      expect(donneesPersistees).toEqual({
        idUtilisateur: unUUID('2'),
        brouillon: { id: unUUID('b'), nomService: 'Nom du brouillon' },
      });
    });
  });
});
