import { unService } from '../../constructeurs/constructeurService.js';
import Service from '../../../src/modeles/service.js';
import { ServiceAdministrationOrganisations } from '../../../src/supervision/serviceAdministrationOrganisations.ts';
import { rattacheServiceEtAdmins } from '../../../src/bus/abonnements/rattacheServiceEtAdmins.ts';
import { UUID } from '../../../src/typesBasiques.ts';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';

describe("L'abonné en charge de rattacher un nouveau service à ses administrateurs", () => {
  it("délègue le rattachement au service d'administration des organisations", async () => {
    let serviceRecu;
    let idRecu;
    const serviceAdministrationOrganisations = {
      rattacheLesAdministrateursDe: async (
        idActeur: UUID,
        service: Service
      ) => {
        serviceRecu = service;
        idRecu = idActeur;
      },
    } as ServiceAdministrationOrganisations;

    const service = unService().avecId('S1').construis();
    const utilisateur = unUtilisateur().avecId('U1').construis();

    await rattacheServiceEtAdmins({ serviceAdministrationOrganisations })({
      service,
      utilisateur,
    });

    expect(serviceRecu!.id).toEqual('S1');
    expect(idRecu).toEqual('U1');
  });
});
