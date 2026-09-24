import { EvenementMesureModifieeEnMasse } from '../../../src/modeles/journalMSS/evenementMesureModifieeEnMasse.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de mesure modifiée en masse', () => {
  it("consigne l'identifiant haché de l'utilisateur et le détail de la modification", () => {
    const evenement = new EvenementMesureModifieeEnMasse(
      {
        idUtilisateur: unUUID('d'),
        idMesure: 'uneMesure',
        statutModifie: true,
        modalitesModifiees: false,
        nombreServicesConcernes: 2,
        type: 'generale',
      },
      { date: 1751358284051, adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'MESURE_MODIFIEE_EN_MASSE',
      donnees: {
        idUtilisateur: unUUID('D'),
        idMesure: 'uneMesure',
        statutModifie: true,
        modalitesModifiees: false,
        nombreServicesConcernes: 2,
        type: 'generale',
      },
      date: 1751358284051,
    });
  });
});
