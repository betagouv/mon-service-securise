import { DescriptionServiceV2 } from '../../src/modeles/descriptionServiceV2.ts';

describe('Une description service V2', () => {
  it("peut s'instancier", () => {
    const descriptionV2 = new DescriptionServiceV2({
      nomService: 'Mairie',
      organisationResponsable: {
        nom: 'Ville V',
        siret: '1111111111111',
        departement: '33',
      },
    });

    expect(descriptionV2.nomService).toBe('Mairie');
    expect(descriptionV2.organisationResponsable.nom).toBe('Ville V');
    expect(descriptionV2.organisationResponsable.siret).toBe('1111111111111');
    expect(descriptionV2.organisationResponsable.departement).toBe('33');
  });
});
