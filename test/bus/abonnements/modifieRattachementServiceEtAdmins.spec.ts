import { unService } from '../../constructeurs/constructeurService.js';
import uneDescriptionValide from '../../constructeurs/constructeurDescriptionService.js';
import { ServiceAdministrationOrganisations } from '../../../src/supervision/serviceAdministrationOrganisations.ts';
import { modifieRattachementServiceEtAdmins } from '../../../src/bus/abonnements/modifieRattachementServiceEtAdmins.ts';

describe("L'abonné en charge de modifier le rattachement entre un service modifié et ses admins", () => {
  let serviceAdministrationOrganisations: ServiceAdministrationOrganisations;

  beforeEach(() => {
    serviceAdministrationOrganisations = {
      rattacheLesAdministrateursDe: vi.fn(),
    } as unknown as ServiceAdministrationOrganisations;
  });

  it("ne fait rien si le SIRET n'a pas changé", async () => {
    const service = unService()
      .avecOrganisationResponsable({
        siret: 'unSIRET',
      })
      .construis();
    const ancienneDescription = uneDescriptionValide()
      .deLOrganisation({ siret: 'unSIRET' })
      .construis();

    await modifieRattachementServiceEtAdmins({
      serviceAdministrationOrganisations,
    })({
      service,
      ancienneDescription,
    });

    expect(
      serviceAdministrationOrganisations.rattacheLesAdministrateursDe
    ).not.toHaveBeenCalled();
  });

  it("délègue au service d'administration des organisations la modification du rattachement si le SIRET a changé", async () => {
    const service = unService()
      .avecId('S1')
      .avecOrganisationResponsable({
        siret: 'unSIRET',
      })
      .construis();
    const ancienneDescription = uneDescriptionValide()
      .deLOrganisation({ siret: 'unAutreSIRET' })
      .construis();

    await modifieRattachementServiceEtAdmins({
      serviceAdministrationOrganisations,
    })({
      service,
      ancienneDescription,
    });

    expect(
      serviceAdministrationOrganisations.rattacheLesAdministrateursDe
    ).toHaveBeenCalledWith(service);
  });
});
