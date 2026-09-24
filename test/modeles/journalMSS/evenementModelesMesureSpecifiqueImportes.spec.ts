import EvenementModelesMesureSpecifiqueImportes from '../../../src/modeles/journalMSS/evenementModelesMesureSpecifiqueImportes.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de modèles de mesure spécifique importés', () => {
  it("consigne l'identifiant haché de l'utilisateur et le nombre de modèles importés", () => {
    const evenement = new EvenementModelesMesureSpecifiqueImportes(
      { idUtilisateur: unUUID('a'), nbModelesMesureSpecifiqueImportes: 42 },
      { date: '19/08/2025', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'MODELES_MESURE_SPECIFIQUE_IMPORTES',
      donnees: {
        idUtilisateur: unUUID('A'),
        nbModelesMesureSpecifiqueImportes: 42,
      },
      date: '19/08/2025',
    });
  });
});
