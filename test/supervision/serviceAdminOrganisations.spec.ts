import * as DepotDonneesAutorisations from '../../src/depots/depotDonneesAutorisations.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { unServiceV2 } from '../constructeurs/constructeurService.js';
import { uneAutorisation } from '../constructeurs/constructeurAutorisation.js';
import { ServiceAdminOrganisations } from '../../src/supervision/serviceAdminOrganisations.js';
import { fabriqueAdaptateurUUID } from '../../src/adaptateurs/adaptateurUUID.ts';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';

describe("Le service de gestion des admins d'organisation", () => {
  describe("sur demande de rattachement d'un service et ses admins", () => {
    it('crée les autorisations admins correspondantes', async () => {
      const depotAutorisations = DepotDonneesAutorisations.creeDepot({
        adaptateurPersistance: unePersistanceMemoire()
          .ajouteUneAutorisation(
            uneAutorisation().deProprietaire(unUUID('u0'), unUUID('s')).donnees
          )
          .construis(),
        busEvenements: fabriqueBusPourLesTests(),
      });
      const unService = unServiceV2()
        .avecId(unUUID('s'))
        .avecOrganisationResponsable({ siret: '1234' })
        .construis();
      const service = new ServiceAdminOrganisations({
        adaptateurUUID: fabriqueAdaptateurUUID(),
        depotDonnees: {
          ...depotAutorisations,
          lisAdminsPour: async () => [unUUID('u1')],
        },
      });

      await service.rattacheService(unService);

      const autorisationsDuService =
        await depotAutorisations.autorisationsDuService(unUUID('s'));
      expect(autorisationsDuService.length).toBe(2);
    });
  });
});
