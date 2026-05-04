import * as DepotDonneesAutorisations from '../../src/depots/depotDonneesAutorisations.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { unServiceV2 } from '../constructeurs/constructeurService.js';
import { ServiceAdministrationOrganisations } from '../../src/supervision/serviceAdministrationOrganisations.js';
import { fabriqueAdaptateurUUID } from '../../src/adaptateurs/adaptateurUUID.ts';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';

describe("Le service de gestion des admins d'organisation", () => {
  describe("sur demande de rattachement d'un service à ses admins", () => {
    const depotAutorisations = DepotDonneesAutorisations.creeDepot({
      adaptateurPersistance: unePersistanceMemoire().construis(),
      busEvenements: fabriqueBusPourLesTests(),
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
          },
        });

      await administrationOrganisations.rattacheLesAdministrateursDe(unService);

      const autorisationsDuService =
        await depotAutorisations.autorisationsDuService(unUUID('s'));
      const [admin] = autorisationsDuService;
      expect(admin.idUtilisateur).toBe(unUUID('u1'));
    });
  });
});
