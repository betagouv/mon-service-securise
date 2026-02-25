import { ErreurNiveauGraviteInconnu } from '../../src/erreurs.js';
import Risque from '../../src/modeles/risque.js';
import { creeReferentiel } from '../../src/referentiel.js';
import { Referentiel } from '../../src/referentiel.interface.ts';

describe('Un risque', () => {
  let referentiel: Referentiel;
  beforeEach(() => {
    referentiel = creeReferentiel();
  });

  it('vérifie que le niveau de gravité est bien répertorié', () => {
    expect(() => new Risque({ niveauGravite: 'niveauInconnu' })).toThrowError(
      new ErreurNiveauGraviteInconnu(
        'Le niveau de gravité "niveauInconnu" n\'est pas répertorié'
      )
    );
  });

  it('connaît son importance', () => {
    referentiel.recharge({
      niveauxGravite: {
        negligeable: { important: false },
        significatif: { important: true },
      },
    });

    const risqueNegligeable = new Risque(
      { niveauGravite: 'negligeable' },
      referentiel
    );
    expect(risqueNegligeable.important()).toBe(false);

    const risqueSignificatif = new Risque(
      { niveauGravite: 'significatif' },
      referentiel
    );
    expect(risqueSignificatif.important()).toBe(true);
  });

  it('connaît la description de son niveau de gravité', () => {
    referentiel.recharge({
      niveauxGravite: { unNiveau: { description: 'Une description' } },
    });
    const risque = new Risque({ niveauGravite: 'unNiveau' }, referentiel);
    expect(risque.descriptionNiveauGravite()).toEqual('Une description');
  });

  it('sait se décrire', () => {
    referentiel.recharge({
      niveauxGravite: { unNiveau: { description: 'Une description' } },
    });
    const risque = new Risque(
      { niveauGravite: 'unNiveau', commentaire: 'Un commentaire' },
      referentiel
    );

    expect(risque.toJSON()).toEqual({
      commentaire: 'Un commentaire',
      niveauGravite: 'unNiveau',
    });
  });

  describe('sait calculer son niveau de risque', () => {
    beforeEach(() => {
      referentiel.recharge({
        niveauxGravite: {
          nonConcerne: { description: 'Une description', position: 0 },
        },
        vraisemblancesRisques: {
          invraisemblable: { description: 'Une description', position: 0 },
        },
        niveauxRisques: {
          eleve: { correspondances: [{ gravite: 0, vraisemblance: 0 }] },
        },
      });
    });

    it("quand la gravité n'est pas définie", () => {
      const risque = new Risque({ niveauGravite: undefined });

      const niveauRisque = risque.niveauRisque();

      expect(niveauRisque).toBe('indeterminable');
      expect(Risque.NIVEAU_RISQUE_INDETERMINABLE).toBe('indeterminable');
    });

    it('quand la gravité et la vraisemblance sont définis dans la matrice de risques', () => {
      const risque = new Risque(
        {
          niveauGravite: 'nonConcerne',
          niveauVraisemblance: 'invraisemblable',
        },
        referentiel
      );

      const niveauRisque = risque.niveauRisque();

      expect(niveauRisque).toBe('eleve');
    });
  });
});
