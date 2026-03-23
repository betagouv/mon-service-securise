import { RisqueSpecifiqueV2 } from '../../../src/moteurRisques/v2/risqueSpecifiqueV2.ts';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Le risque spécifique V2', () => {
  it('peut se sérialiser en JSON', () => {
    const risqueSpecifique = new RisqueSpecifiqueV2({
      id: unUUID('a'),
      intitule: 'intitule',
      description: 'description',
      categories: ['integrite'],
      risqueBrut: { gravite: 2, vraisemblance: 3 },
      gravite: 1,
      vraisemblance: 4,
      commentaire: 'commentaire',
    });

    expect(risqueSpecifique.toJSON()).toEqual({
      id: unUUID('a'),
      intitule: 'intitule',
      description: 'description',
      categories: ['integrite'],
      graviteBrute: 2,
      vraisemblanceBrute: 3,
      gravite: 1,
      vraisemblance: 4,
      commentaire: 'commentaire',
    });
  });

  it('connait ses données à persister', () => {
    const risqueSpecifique = new RisqueSpecifiqueV2({
      id: unUUID('a'),
      intitule: 'intitule',
      description: 'description',
      categories: ['integrite'],
      risqueBrut: { gravite: 2, vraisemblance: 3 },
      gravite: 1,
      vraisemblance: 4,
      commentaire: 'commentaire',
    });

    expect(risqueSpecifique.donneesSerialisees()).toEqual({
      id: unUUID('a'),
      intitule: 'intitule',
      description: 'description',
      categories: ['integrite'],
      risqueBrut: { gravite: 2, vraisemblance: 3 },
      gravite: 1,
      vraisemblance: 4,
      commentaire: 'commentaire',
    });
  });
});
