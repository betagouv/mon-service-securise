import { ErreurRisqueInconnu } from '../../src/erreurs.js';
import RisqueGeneral from '../../src/modeles/risqueGeneral.js';
import Risque from '../../src/modeles/risque.js';
import { Referentiel } from '../../src/referentiel.interface.ts';
import { creeReferentiel } from '../../src/referentiel.js';

describe('Un risque général', () => {
  let referentiel: Referentiel;

  beforeEach(() => {
    referentiel = creeReferentiel();
    referentiel.recharge({
      niveauxGravite: { unNiveau: {} },
      risques: {
        unRisque: {
          description: 'Une description',
          categories: ['CR1'],
          identifiantNumerique: 'R1',
        },
      },
    });
  });

  it('retourne un JSON avec incluant la description du risque', () => {
    const risque = new RisqueGeneral({ id: 'unRisque' }, referentiel);
    expect(risque.toJSON().intitule).toEqual('Une description');
  });

  it('sait se décrire', () => {
    const risque = new RisqueGeneral(
      {
        id: 'unRisque',
        commentaire: 'Un commentaire',
        niveauGravite: 'unNiveau',
        desactive: true,
      },
      referentiel
    );

    expect(risque.id).toEqual('unRisque');
    expect(risque.commentaire).toEqual('Un commentaire');
    expect(risque.niveauGravite).toEqual('unNiveau');
    expect(risque.desactive).toEqual(true);
    expect(risque.toJSON()).toEqual({
      id: 'unRisque',
      commentaire: 'Un commentaire',
      intitule: 'Une description',
      niveauGravite: 'unNiveau',
      categories: ['CR1'],
      identifiantNumerique: 'R1',
      niveauRisque: Risque.NIVEAU_RISQUE_INDETERMINABLE,
      desactive: true,
    });
  });

  it('connaît son intitulé', () => {
    referentiel.recharge({
      risques: { unRisque: { description: 'Une description' } },
    });
    const risque = new RisqueGeneral({ id: 'unRisque' }, referentiel);
    expect(risque.intituleRisque()).toEqual('Une description');
  });

  it('connaît ses catégories', () => {
    referentiel.recharge({
      risques: {
        unRisque: { description: 'Une description', categories: ['C1'] },
      },
      categoriesRisques: { C1: {} },
    });
    const risque = new RisqueGeneral({ id: 'unRisque' }, referentiel);
    expect(risque.categoriesRisque()).toEqual(['C1']);
  });

  it('retourne un JSON partiel si certaines informations sont inexistantes', () => {
    const risque = new RisqueGeneral({ id: 'unRisque' }, referentiel);
    expect(risque.toJSON()).toEqual({
      id: 'unRisque',
      intitule: 'Une description',
      categories: ['CR1'],
      identifiantNumerique: 'R1',
      niveauRisque: Risque.NIVEAU_RISQUE_INDETERMINABLE,
    });
  });

  it('vérifie que le risque est bien répertorié', () => {
    expect(
      () => new RisqueGeneral({ id: 'identifiantInconnu' }, referentiel)
    ).toThrowError(
      new ErreurRisqueInconnu(
        'Le risque "identifiantInconnu" n\'est pas répertorié'
      )
    );
  });

  it('sait se sérialiser', () => {
    const risque = new RisqueGeneral(
      {
        id: 'unRisque',
        commentaire: 'Un commentaire',
        niveauGravite: 'unNiveau',
        desactive: true,
      },
      referentiel
    );

    expect(risque.donneesSerialisees()).toEqual({
      id: 'unRisque',
      commentaire: 'Un commentaire',
      niveauGravite: 'unNiveau',
      desactive: true,
    });
  });
});
