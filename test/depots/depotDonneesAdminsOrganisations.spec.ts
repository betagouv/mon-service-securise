import { creeDepot } from '../../src/depots/depotDonneesAdminsOrganisations.ts';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import { AdaptateurPersistance } from '../../src/adaptateurs/adaptateurPersistance.interface.ts';
import { AdaptateurChiffrement } from '../../src/adaptateurs/adaptateurChiffrement.interface.ts';
import { AdaptateurRechercheEntreprise } from '../../src/adaptateurs/adaptateurRechercheEntreprise.interface.ts';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { DepotDonneesAdminsOrganisations } from '../../src/depots/depotDonneesAdminsOrganisations.interface.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import Entite from '../../src/modeles/entite.ts';
import { unAdaptateurChiffrementQuiWrap } from '../mocks/adaptateurChiffrementQuiWrap.ts';

describe("Le dépôt de données d'admin des organisations", () => {
  describe("concernant la lecture des admins d'une organisation", () => {
    it('appelle la persistance avec un SIRET haché', async () => {
      let siretPersistance;

      const depot = creeDepot({
        persistance: {
          lisAdminsPour: (siret: string) => {
            siretPersistance = siret;
            return [];
          },
        } as unknown as AdaptateurPersistance,
        chiffrement:
          fauxAdaptateurChiffrement() as unknown as AdaptateurChiffrement,
        adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      });

      await depot.lisAdminsPour('SIRET');

      expect(siretPersistance).toBe('SIRET-haché256');
    });
  });

  describe('concernant la lecture des entités administrées par un admin', () => {
    let depot: DepotDonneesAdminsOrganisations;
    let adaptateurPersistance: AdaptateurPersistance;
    let adaptateurChiffrement: AdaptateurChiffrement;

    beforeEach(() => {
      adaptateurPersistance =
        unePersistanceMemoire().construis() as AdaptateurPersistance;
      adaptateurChiffrement = unAdaptateurChiffrementQuiWrap();
      depot = creeDepot({
        persistance: adaptateurPersistance,
        chiffrement: adaptateurChiffrement,
        adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      });
    });

    it("déchiffre les données d'entité persistées", async () => {
      const idAdmin = unUUID('1');
      await adaptateurPersistance.ajouteEntiteAAdmin(
        idAdmin,
        'SIRET-123-haché',
        await adaptateurChiffrement.chiffre({
          nom: 'NomEntite',
          siret: 'SIRET-123',
          departement: '75',
        })
      );

      const entites = await depot.entitesAdministreesPar(idAdmin);

      expect(entites).toEqual([
        new Entite({
          nom: 'NomEntite',
          siret: 'SIRET-123',
          departement: '75',
        }),
      ]);
    });
  });

  describe("concernant l'ajout d'une entité administrée à un utilisateur", () => {
    let depot: DepotDonneesAdminsOrganisations;
    let adaptateurPersistance: AdaptateurPersistance;
    let adaptateurChiffrement: AdaptateurChiffrement;

    let adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
    beforeEach(() => {
      adaptateurPersistance =
        unePersistanceMemoire().construis() as AdaptateurPersistance;
      adaptateurRechercheEntite = fauxAdaptateurRechercheEntreprise();
      adaptateurChiffrement = unAdaptateurChiffrementQuiWrap();
      depot = creeDepot({
        persistance: adaptateurPersistance,
        chiffrement: adaptateurChiffrement,
        adaptateurRechercheEntite,
      });
    });

    it("complète les informations de l'organisation responsable et délègue à la persistance la sauvegarde des entites chiffrées", async () => {
      adaptateurRechercheEntite.rechercheOrganisations = async () => [
        {
          nom: 'MonEntite',
          departement: '75',
          siret: 'SIRET-123',
        },
      ];
      adaptateurPersistance.ajouteEntiteAAdmin = vi.fn();

      await depot.ajouteSiretAAdmin(unUUID('1'), 'SIRET-123');

      expect(adaptateurPersistance.ajouteEntiteAAdmin).toHaveBeenCalledWith(
        unUUID('1'),
        'SIRET-123-haché256',
        {
          chiffre: true,
          coffreFort: {
            nom: 'MonEntite',
            departement: '75',
            siret: 'SIRET-123',
          },
        }
      );
    });
  });
});
