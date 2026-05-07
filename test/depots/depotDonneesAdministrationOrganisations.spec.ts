import { creeDepot } from '../../src/depots/depotDonneesAdministrationOrganisations.ts';
import fauxAdaptateurChiffrement from '../mocks/adaptateurChiffrement.js';
import { AdaptateurPersistance } from '../../src/adaptateurs/adaptateurPersistance.interface.ts';
import { AdaptateurChiffrement } from '../../src/adaptateurs/adaptateurChiffrement.interface.ts';
import { AdaptateurRechercheEntreprise } from '../../src/adaptateurs/adaptateurRechercheEntreprise.interface.ts';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import * as depotDonneesSuperviseurs from '../../src/depots/depotDonneesSuperviseurs.ts';
import { DepotDonneesAdministrationOrganisations } from '../../src/depots/depotDonneesAdministrationOrganisations.interface.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import Entite from '../../src/modeles/entite.ts';
import { DepotDonneesSuperviseurs } from '../../src/depots/depotDonneesSuperviseurs.interface.ts';

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
        depotSuperviseurs: {} as unknown as DepotDonneesSuperviseurs,
      });

      await depot.lisAdminsPour('SIRET');

      expect(siretPersistance).toBe('SIRET-haché256');
    });
  });

  describe('concernant la lecture des entités administrées par un utilisateur', () => {
    let depot: DepotDonneesAdministrationOrganisations;
    let depotSuperviseurs: DepotDonneesSuperviseurs;
    let adaptateurPersistance: AdaptateurPersistance;
    let adaptateurRechercheEntite: AdaptateurRechercheEntreprise;

    beforeEach(() => {
      adaptateurRechercheEntite = fauxAdaptateurRechercheEntreprise();
      adaptateurPersistance =
        unePersistanceMemoire().construis() as AdaptateurPersistance;
      depotSuperviseurs = depotDonneesSuperviseurs.creeDepot({
        adaptateurPersistance,
        adaptateurRechercheEntite,
      });
      depot = creeDepot({
        persistance: adaptateurPersistance,
        chiffrement: fauxAdaptateurChiffrement(),
        depotSuperviseurs,
      });
    });

    it("utilise le dépôt des superviseurs pour lister les entités d'un superviseur", async () => {
      const idSuperviseur = unUUID('1');
      await adaptateurPersistance.ajouteEntiteAuSuperviseur(idSuperviseur, {
        nom: 'NomEntite',
        siret: 'SIRET-123',
        departement: '75',
      });

      const entites = await depot.entitesAdministreesPar(idSuperviseur);

      expect(entites).toEqual([
        new Entite({
          nom: 'NomEntite',
          siret: 'SIRET-123',
          departement: '75',
        }),
      ]);
    });

    it("utilise la persistance pour lister les entités d'un admin", async () => {
      const idAdmin = unUUID('1');
      await adaptateurPersistance.ajouteEntiteAAdmin(
        idAdmin,
        'SIRET-123-haché',
        {
          nom: 'NomEntite',
          siret: 'SIRET-123',
          departement: '75',
        }
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
});
