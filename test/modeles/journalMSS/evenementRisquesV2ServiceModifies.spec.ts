import { unUUID, unUUIDRandom } from '../../constructeurs/UUID.ts';
import { EvenementRisquesV2ServiceModifies } from '../../../src/modeles/journalMSS/evenementRisquesV2ServiceModifies.ts';
import { RisquesV2 } from '../../../src/moteurRisques/v2/risquesV2.ts';
import { RisqueV2 } from '../../../src/moteurRisques/v2/risqueV2.ts';
import { RisqueSpecifiqueV2 } from '../../../src/moteurRisques/v2/risqueSpecifiqueV2.ts';

describe('Un événement de risques V2 modifiés', () => {
  const idRisqueSpecifique = unUUIDRandom();

  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur?.toUpperCase(),
  };

  const desRisques = () =>
    new RisquesV2({
      risques: [
        new RisqueV2('V3', { OV1: 3 }, 4, [], {}),
        new RisqueV2('V4', { OV1: 3 }, 4, [], {
          desactive: true,
          commentaire: 'quelque chose',
          graviteSurchargee: 1,
        }),
      ],
      risquesBruts: [],
      risquesCibles: [],
      risquesSpecifiques: [
        new RisqueSpecifiqueV2({
          categories: ['integrite'],
          commentaire: 'un comm',
          description: 'une description',
          intitule: 'un intitule',
          id: idRisqueSpecifique,
          vraisemblance: 1,
          gravite: 2,
          risqueBrut: { gravite: 3, vraisemblance: 4 },
        }),
      ],
    });

  it("hache l'identifiant du service qui lui est donné", () => {
    const evenement = new EvenementRisquesV2ServiceModifies(
      unUUID('s'),
      desRisques(),
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    const json = evenement.toJSON();

    expect(json.donnees.idService).toBe(unUUID('S'));
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementRisquesV2ServiceModifies(
      unUUID('s'),
      desRisques(),
      {
        date: '26/06/2026',
        adaptateurChiffrement: hacheEnMajuscules,
      }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'RISQUES_V2_SERVICE_MODIFIES',
      donnees: {
        idService: unUUID('S'),
        risquesGeneraux: [
          {
            id: 'R3',
            desactive: false,
            avecCommentaire: false,
            valeurGraviteCalculee: 3,
            valeurGraviteSurchargee: null,
          },
          {
            id: 'R4',
            desactive: true,
            avecCommentaire: true,
            valeurGraviteCalculee: 3,
            valeurGraviteSurchargee: 1,
          },
        ],
        risquesSpecifiques: [
          {
            id: idRisqueSpecifique,
            valeurVraisemblance: 1,
            valeurGravite: 2,
            valeurVraisemblanceBrute: 4,
            valeurGraviteBrute: 3,
            categories: ['integrite'],
          },
        ],
      },
      date: '26/06/2026',
    });
  });
});
