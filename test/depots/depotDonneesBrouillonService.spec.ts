import { DonneesChiffrees, UUID } from '../../src/typesBasiques.ts';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import * as DepotDonneesBrouillonService from '../../src/depots/depotDonneesBrouillonService.ts';
import * as DepotDonneesServices from '../../src/depots/depotDonneesServices.js';
import { DonneesBrouillonService } from '../../src/depots/depotDonneesBrouillonService.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import * as AdaptateurPersistanceMemoire from '../../src/adaptateurs/adaptateurPersistanceMemoire.js';
import { AdaptateurUUID } from '../../src/adaptateurs/adaptateurUUID.js';
import { ErreurBrouillonInexistant } from '../../src/erreurs.js';
import { DepotDonneesService } from '../../src/depots/depotDonneesService.interface.js';
import {
  AdaptateurChiffrement,
  ChaineOuObjet,
} from '../../src/adaptateurs/adaptateurChiffrement.interface.js';

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
    adaptateurChiffrement = fauxAdaptateurChiffrement();
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
    it('délègue à la persistance la sauvegarde du brouillon', async () => {
      let donneesPersistees;
      persistance.ajouteBrouillonService = async (
        id: UUID,
        idUtilisateur: UUID,
        brouillon: { nomService: string }
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
        brouillon: { nomService: 'Nom du brouillon' },
      });
      expect(idCree).toBe(unUUID('b'));
    });

    it('chiffre les données du brouillon', async () => {
      adaptateurChiffrement.chiffre = async (donnees: ChaineOuObjet) => {
        if (typeof donnees === 'string')
          throw new Error('Pas supposé chiffrer une chaîne');

        return { ...donnees, chiffre: true };
      };

      let donneesPersistees;
      persistance.ajouteBrouillonService = async (
        id: UUID,
        idUtilisateur: UUID,
        brouillon: DonneesChiffrees
      ) => {
        donneesPersistees = { id, idUtilisateur, brouillon };
      };

      await leDepot().nouveauBrouillonService(unUUID('2'), 'Nom du brouillon');

      expect(donneesPersistees!.brouillon.chiffre).toBe(true);
    });
  });

  describe("sur demande de récupération des brouillons d'un utilisateur", () => {
    it('délègue à la persistance la lecture des brouillons', async () => {
      let idRecu: UUID | null = null;
      persistance.lisBrouillonsService = async (idUtilisateur: UUID) => {
        idRecu = idUtilisateur;
        return [{ donnees: { nomService: 'nom du service' }, id: unUUID('b') }];
      };

      const brouillons = await leDepot().lisBrouillonsService(unUUID('2'));

      expect(idRecu).toBe(unUUID('2'));
      expect(brouillons.length).toBe(1);
    });

    it('déchiffre les données du brouillon', async () => {
      adaptateurChiffrement.dechiffre<DonneesBrouillonService> = async (
        donneesBrouillon: DonneesChiffrees
      ) => {
        if (typeof donneesBrouillon === 'string')
          throw new Error('Pas supposé déchiffrer une chaîne');

        return { nomService: `${donneesBrouillon.nomService}-dechiffre` };
      };
      persistance.lisBrouillonsService = async () => [
        { donnees: { nomService: 'nom du service' }, id: unUUID('b') },
      ];

      const brouillons = await leDepot().lisBrouillonsService(unUUID('2'));

      expect(brouillons[0].nomService).toBe('nom du service-dechiffre');
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
