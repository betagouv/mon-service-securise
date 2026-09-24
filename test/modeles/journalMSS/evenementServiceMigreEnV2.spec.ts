import EvenementServiceMigreEnV2 from '../../../src/modeles/journalMSS/evenementServiceMigreEnV2.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de service V1 migré en V2', () => {
  it("consigne les identifiants hachés du service et de l'utilisateur", () => {
    const evenement = new EvenementServiceMigreEnV2(
      { idService: unUUID('a'), idUtilisateur: unUUID('b') },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'SERVICE_V1_MIGRE_EN_V2',
      donnees: { idService: unUUID('A'), idUtilisateur: unUUID('B') },
      date: '17/11/2022',
    });
  });
});
