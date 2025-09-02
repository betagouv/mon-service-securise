import { DescriptionServiceV2 } from '../../src/modeles/descriptionServiceV2.ts';

describe('Une description service V2', () => {
  it('a un nom de service', () => {
    const descriptionV2 = new DescriptionServiceV2({ nomService: 'Mairie' });

    expect(descriptionV2.nomService).toBe('Mairie');
  });
});
