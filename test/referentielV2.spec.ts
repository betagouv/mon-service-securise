import { creeReferentielV2 } from '../src/referentielV2.js';
import { creeReferentiel } from '../src/referentiel.js';
import { besoins } from './moteurRegles/v2/besoinsDeSecurite.js';

describe('Le référentiel V2', () => {
  it('utilise les méthodes du référentiel v1 dans le cas général', () => {
    const referentielV2 = creeReferentielV2();
    const referentielV1 = creeReferentiel();

    expect(referentielV2.versionActuelleCgu()).toEqual(
      referentielV1.versionActuelleCgu()
    );
  });

  it('retourne v2 comme version de référentiel', () => {
    const referentielV2 = creeReferentielV2();

    expect(referentielV2.version()).toEqual('v2');
  });

  describe('concernant les méthodes surchargées du référentielV2', () => {
    it('retourne une mesure par id v2', () => {
      const referentielV2 = creeReferentielV2();

      const mesure = referentielV2.mesure('RECENSEMENT.1');

      expect(mesure.identifiantNumerique).toEqual('0001');
    });

    it('sait dire si un identifiant de mesure est valide pour le référentiel v2', () => {
      const referentielV2 = creeReferentielV2();

      expect(referentielV2.estIdentifiantMesureConnu('RECENSEMENT.1')).toBe(
        true
      );
      expect(referentielV2.estIdentifiantMesureConnu('pasunidconnu')).toBe(
        false
      );
    });
  });

  describe('concernant les méthodes spécifiques du référentielV2', () => {
    describe('concernant les règles du moteur de règles v2', () => {
      it("peut restituer les règles qu'on lui donne", () => {
        const referentiel = creeReferentielV2();

        referentiel.enregistreReglesMoteurV2([
          {
            reference: 'RECENSEMENT.1',
            dansSocleInitial: true,
            modificateurs: {},
            besoinsDeSecurite: besoins('R-R-R'),
          },
        ]);

        expect(referentiel.reglesMoteurV2()).toHaveLength(1);
        expect(referentiel.reglesMoteurV2()[0].reference).toBe('RECENSEMENT.1');
      });
    });
  });
});
