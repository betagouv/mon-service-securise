import * as crypto from 'node:crypto';
import { UUID } from '../../src/typesBasiques.ts';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import * as DepotDonneesBrouillonService from '../../src/depots/depotDonneesBrouillonService.ts';
import * as DepotDonneesServices from '../../src/depots/depotDonneesServices.js';
import { unUUID, unUUIDRandom } from '../constructeurs/UUID.ts';
import * as AdaptateurPersistanceMemoire from '../../src/adaptateurs/adaptateurPersistanceMemoire.js';
import { AdaptateurUUID } from '../../src/adaptateurs/adaptateurUUID.js';
import { ErreurBrouillonInexistant } from '../../src/erreurs.js';
import { DepotDonneesService } from '../../src/depots/depotDonneesService.interface.js';
import { AdaptateurChiffrement } from '../../src/adaptateurs/adaptateurChiffrement.interface.js';
import { unAdaptateurChiffrementQuiWrap } from '../mocks/adaptateurChiffrementQuiWrap.js';
import { BrouillonService } from '../../src/modeles/brouillonService.js';

describe('Le dépôt de données des brouillons de Service', () => {
  let persistance: ReturnType<
    typeof AdaptateurPersistanceMemoire.nouvelAdaptateur
  >;
  let adaptateurUUID: AdaptateurUUID;
  let adaptateurChiffrement: AdaptateurChiffrement;
  let depotDonneesService: DepotDonneesService;

  beforeEach(() => {
    persistance = unePersistanceMemoire().construis();
    adaptateurUUID = { genereUUID: () => crypto.randomUUID() as UUID };
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
      adaptateurUUID.genereUUID = () => unUUID('b');
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
      await persistance.ajouteBrouillonService(
        unUUIDRandom(),
        unUUID('u'),
        await adaptateurChiffrement.chiffre({ nomService: 'Service #1' })
      );
      await persistance.ajouteBrouillonService(
        unUUIDRandom(),
        unUUID('u'),
        await adaptateurChiffrement.chiffre({ nomService: 'Service #2' })
      );

      const brouillons = await leDepot().lisBrouillonsService(unUUID('u'));

      expect(brouillons).toHaveLength(2);
      const [a, b] = brouillons;
      expect(a.donneesAPersister().nomService).toBe('Service #1');
      expect(b.donneesAPersister().nomService).toBe('Service #2');
    });
  });

  describe("sur demande de récupération d'un brouillon d'un utilisateur", () => {
    it('récupère des données depuis la persistance puis les déchiffre', async () => {
      const idUtilisateur = unUUID('1');
      const idBrouillon = unUUID('2');
      await persistance.ajouteBrouillonService(
        idBrouillon,
        idUtilisateur,
        await adaptateurChiffrement.chiffre({ nomService: 'Service #1' })
      );

      const brouillon = await leDepot().lisBrouillonService(
        idUtilisateur,
        idBrouillon
      );

      expect(brouillon.donneesAPersister().nomService).toBe('Service #1');
    });

    it("jette une erreur si le brouillon n'existe pas", async () => {
      const idUtilisateur = unUUID('1');
      const idBrouillon = unUUID('2');

      await expect(
        leDepot().lisBrouillonService(idUtilisateur, idBrouillon)
      ).rejects.toThrowError(ErreurBrouillonInexistant);
    });
  });

  describe("sur demande de finalisation d'un brouillon", () => {
    it("jette une exception si le brouillon n'existe pas", async () => {
      await expect(
        leDepot().finaliseBrouillonService(unUUID('1'), unUUID('2'))
      ).rejects.toThrowError(ErreurBrouillonInexistant);
    });

    it("délègue au dépot de service la création d'un service V2 et renvoie l'ID du nouveau service", async () => {
      const idBrouillon = unUUID('B');
      await persistance.ajouteBrouillonService(
        idBrouillon,
        unUUID('U'),
        await adaptateurChiffrement.chiffre({ nomService: 'Mairie A' })
      );
      depotDonneesService.nouveauService = async (
        idUtilisateur: UUID,
        donneesService
      ) => {
        expect(idUtilisateur).toBe(unUUID('U'));
        expect(donneesService).toMatchObject({
          versionService: 'v2',
          descriptionService: { nomService: 'Mairie A' },
        });
        return unUUID('S');
      };

      const idNouveauService = await leDepot().finaliseBrouillonService(
        unUUID('U'),
        idBrouillon
      );

      expect(idNouveauService).toBe(unUUID('S'));
    });

    it("supprime le brouillon qui vient d'être finalisé", async () => {
      depotDonneesService.nouveauService = async () => unUUID('S');
      const idAFinaliser = unUUID('B');
      await persistance.ajouteBrouillonService(
        idAFinaliser,
        unUUID('U'),
        await adaptateurChiffrement.chiffre({ nomService: 'Mairie A' })
      );

      await leDepot().finaliseBrouillonService(unUUID('U'), idAFinaliser);

      const restants = await persistance.lisBrouillonsService(unUUID('U'));
      expect(restants).toHaveLength(0);
    });
  });

  describe("sur demande de sauvegarde d'un brouillon", () => {
    it("délègue à la persistance la sauvegarde du brouillon qu'il aura chiffré", async () => {
      const idBrouillonExistant = unUUID('1');
      const idUtilisateur = unUUID('2');
      await persistance.ajouteBrouillonService(
        idBrouillonExistant,
        idUtilisateur,
        await adaptateurChiffrement.chiffre({ nomService: 'Mairie A' })
      );

      await leDepot().sauvegardeBrouillonService(
        idUtilisateur,
        new BrouillonService(idBrouillonExistant, {
          nomService: 'Mairie A',
          siret: 'un nouveau siret',
        })
      );

      const tousLesBrouillons =
        await persistance.lisBrouillonsService(idUtilisateur);
      expect(tousLesBrouillons[0]).toEqual({
        idUtilisateur,
        id: idBrouillonExistant,
        donnees: {
          chiffre: true,
          coffreFort: {
            nomService: 'Mairie A',
            siret: 'un nouveau siret',
          },
        },
      });
    });
  });
});
