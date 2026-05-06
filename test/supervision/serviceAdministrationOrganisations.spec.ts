import { creeDepot } from '../../src/depots/depotDonneesAutorisations.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { unServiceV2 } from '../constructeurs/constructeurService.js';
import { ServiceAdministrationOrganisations } from '../../src/supervision/serviceAdministrationOrganisations.js';
import { fabriqueAdaptateurUUID } from '../../src/adaptateurs/adaptateurUUID.ts';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';
import { DepotDonneesAutorisation } from '../../src/depots/depotDonneesAutorisations.interface.ts';

describe("Le service de gestion des admins d'organisation", () => {
  describe("sur demande de rattachement d'un service à ses admins", () => {
    let depotAutorisations: DepotDonneesAutorisation;
    beforeEach(() => {
      depotAutorisations = creeDepot({
        adaptateurPersistance: unePersistanceMemoire().construis(),
        busEvenements: fabriqueBusPourLesTests(),
      });
    });

    it('crée les autorisations admins correspondantes', async () => {
      const unService = unServiceV2()
        .avecId(unUUID('s'))
        .avecOrganisationResponsable({ siret: '1234' })
        .construis();
      const administrationOrganisations =
        new ServiceAdministrationOrganisations({
          adaptateurUUID: fabriqueAdaptateurUUID(),
          depotDonnees: {
            ...depotAutorisations,
            lisAdminsPour: async () => [unUUID('u1')],
            supprimeAutorisationsAdminPour: async () => {},
          },
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(unService);

      const autorisationsDuService =
        await depotAutorisations.autorisationsDuService(unUUID('s'));
      const [admin] = autorisationsDuService;
      expect(admin.idUtilisateur).toBe(unUUID('u1'));
    });

    it("élève les droits au rôle d'admin si l'admin est un contributeur existant", async () => {
      const idService = unUUID('s');
      const idProprietaire = unUUID('u1');
      const unService = unServiceV2()
        .avecId(idService)
        .avecOrganisationResponsable({ siret: '1234' })
        .construis();
      await depotAutorisations.sauvegardeAutorisation(
        uneAutorisation().deProprietaire(idProprietaire, idService).construis()
      );
      const administrationOrganisations =
        new ServiceAdministrationOrganisations({
          adaptateurUUID: fabriqueAdaptateurUUID(),
          depotDonnees: {
            ...depotAutorisations,
            lisAdminsPour: async () => [idProprietaire],
            supprimeAutorisationsAdminPour: async () => {},
          },
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(unService);

      const autorisationsDuService =
        await depotAutorisations.autorisationsDuService(idService);
      expect(autorisationsDuService).toHaveLength(1);
      expect(autorisationsDuService[0].estAdmin).toBe(true);
    });

    it('délègue au dépôt la suppression des autorisations admins pré-existantes', async () => {
      const constructeurService = unServiceV2()
        .avecId(unUUID('s'))
        .avecOrganisationResponsable({ siret: '1234' });

      const mockSupprimeAutorisations = vi.fn();
      const administrationOrganisations =
        new ServiceAdministrationOrganisations({
          adaptateurUUID: fabriqueAdaptateurUUID(),
          depotDonnees: {
            ...depotAutorisations,
            sauvegardeAutorisation: async () => {},
            lisAdminsPour: async () => [unUUID('u1')],
            supprimeAutorisationsAdminPour: mockSupprimeAutorisations,
          },
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(
        constructeurService.construis()
      );

      expect(mockSupprimeAutorisations).toHaveBeenCalledWith(unUUID('s'));
    });
  });
});
