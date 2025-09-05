import { UUID } from '../../src/typesBasiques.ts';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import * as DepotDonneesBrouillonService from '../../src/depots/depotDonneesBrouillonService.ts';
import * as DepotDonneesServices from '../../src/depots/depotDonneesServices.js';
import { unUUID } from '../constructeurs/UUID.ts';
import * as AdaptateurPersistanceMemoire from '../../src/adaptateurs/adaptateurPersistanceMemoire.js';
import { AdaptateurUUID } from '../../src/adaptateurs/adaptateurUUID.js';
import { ErreurBrouillonInexistant } from '../../src/erreurs.js';
import { DepotDonneesService } from '../../src/depots/depotDonneesService.interface.js';
import { AdaptateurChiffrement } from '../../src/adaptateurs/adaptateurChiffrement.interface.js';
import { unAdaptateurChiffrementQuiWrap } from '../mocks/adaptateurChiffrementQuiWrap.js';

describe('Le dépôt de données des brouillons de Service', () => {
  let persistance: ReturnType<
    typeof AdaptateurPersistanceMemoire.nouvelAdaptateur
  >;
  let adaptateurUUID: AdaptateurUUID;
  let adaptateurChiffrement: AdaptateurChiffrement;
  let depotDonneesService: DepotDonneesService;

  beforeEach(() => {
    persistance = unePersistanceMemoire().construis();
    adaptateurUUID = { genereUUID: () => unUUID('b') };
    adaptateurChiffrement = unAdaptateurChiffrementQuiWrap();
    depotDonneesService = DepotDonneesServices.creeDepot({
      adaptateurPersistance: persistance,
    });
  });

  const leDepot = () =>
    DepotDonneesBrouillonService.creeDepot({
      persistance,
      adaptateurUUID,
      adaptateurChiffrement,
      depotDonneesService,
    });

  describe('sur demande de création de nouveau brouillon de service', () => {
    it("délègue à la persistance la sauvegarde du brouillon qu'il aura chiffré", async () => {
      let donneesPersistees;
      persistance.ajouteBrouillonService = async (
        id,
        idUtilisateur,
        brouillon
      ) => {
        donneesPersistees = { id, idUtilisateur, brouillon };
      };

      const idCree = await leDepot().nouveauBrouillonService(
        unUUID('2'),
        'Nom du brouillon'
      );

      expect(donneesPersistees).toEqual({
        idUtilisateur: unUUID('2'),
        id: unUUID('b'),
        brouillon: {
          chiffre: true,
          coffreFort: { nomService: 'Nom du brouillon' },
        },
      });
      expect(idCree).toBe(unUUID('b'));
    });
  });

  describe("sur demande de récupération des brouillons d'un utilisateur", () => {
    it('récupère des données depuis la persistance puis les déchiffre', async () => {
      const d = leDepot();
      await d.nouveauBrouillonService(unUUID('u'), 'Service #1');
      await d.nouveauBrouillonService(unUUID('u'), 'Service #2');

      const brouillons = await d.lisBrouillonsService(unUUID('u'));

      expect(brouillons).toHaveLength(2);
      const [a, b] = brouillons;
      expect(a.nomService).toBe('Service #1');
      expect(b.nomService).toBe('Service #2');
    });
  });

  describe("sur demande de finalisation d'un brouillon", () => {
    it("jette une exception si le brouillon n'existe pas", async () => {
      await expect(
        leDepot().finaliseBrouillonService(unUUID('1'), unUUID('2'))
      ).rejects.toThrowError(ErreurBrouillonInexistant);
    });

    it("délègue au dépot de service la création d'un service V2 et renvoie l'ID du nouveau service", async () => {
      const depot = leDepot();
      const idBrouillon = await depot.nouveauBrouillonService(
        unUUID('U'),
        'Mairie A'
      );
      depotDonneesService.nouveauService = async (
        idUtilisateur: UUID,
        donneesService
      ) => {
        expect(idUtilisateur).toBe(unUUID('U'));
        expect(donneesService).toEqual({ nomService: 'Mairie A' });
        return unUUID('S');
      };

      const idNouveauService = await depot.finaliseBrouillonService(
        unUUID('U'),
        idBrouillon
      );

      expect(idNouveauService).toBe(unUUID('S'));
    });

    it.todo("jette une exception si le brouillon n'est pas complet");
  });
});
