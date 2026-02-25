import { ErreurNiveauGraviteInconnu } from '../../src/erreurs.js';
import RisqueSpecifique, {
  DonneesRisqueSpecifique,
} from '../../src/modeles/risqueSpecifique.js';
import Risque from '../../src/modeles/risque.js';
import { Referentiel } from '../../src/referentiel.interface.ts';
import { creeReferentiel } from '../../src/referentiel.js';
import { unUUID } from '../constructeurs/UUID.ts';

describe('Un risque spécifique', () => {
  let referentiel: Referentiel;

  beforeEach(() => {
    referentiel = creeReferentiel();
    referentiel.recharge({
      niveauxGravite: { unNiveau: {} },
      vraisemblancesRisques: { vraisemblable: {} },
      categoriesRisques: { disponibilite: {}, integrite: {} },
    });
  });

  const unRisque = (
    surcharge?: Partial<DonneesRisqueSpecifique>
  ): RisqueSpecifique =>
    new RisqueSpecifique(
      {
        id: unUUID('R'),
        niveauGravite: 'unNiveau',
        niveauVraisemblance: 'vraisemblable',
        intitule: 'un intitulé',
        identifiantNumerique: '0001',
        categories: ['disponibilite'],
        ...surcharge,
      },
      referentiel
    );

  it('sait se décrire', () => {
    const risque = new RisqueSpecifique(
      {
        id: unUUID('R'),
        identifiantNumerique: 'RS1',
        intitule: 'Un intitulé',
        description: 'Un risque',
        commentaire: 'Un commentaire',
        niveauGravite: 'unNiveau',
        niveauVraisemblance: 'vraisemblable',
        categories: ['disponibilite'],
      },
      referentiel
    );

    expect(risque.intitule).toEqual('Un intitulé');
    expect(risque.description).toEqual('Un risque');
    expect(risque.commentaire).toEqual('Un commentaire');
    expect(risque.niveauGravite).toEqual('unNiveau');
    expect(risque.toJSON()).toEqual({
      id: unUUID('R'),
      commentaire: 'Un commentaire',
      intitule: 'Un intitulé',
      description: 'Un risque',
      niveauGravite: 'unNiveau',
      niveauVraisemblance: 'vraisemblable',
      categories: ['disponibilite'],
      identifiantNumerique: 'RS1',
      niveauRisque: Risque.NIVEAU_RISQUE_INDETERMINABLE,
    });
  });

  it("expose son intitulé en cohérence avec l'API des classes sœurs", () => {
    const risque = unRisque({ intitule: 'Un risque' });
    expect(risque.intituleRisque()).toEqual('Un risque');
  });

  it("expose ses catégories en cohérence avec l'API des classes sœurs", () => {
    const risque = unRisque({
      intitule: 'Un risque',
      categories: ['disponibilite', 'integrite'],
    });
    expect(risque.categoriesRisque()).toEqual(['disponibilite', 'integrite']);
  });

  it('vérifie que le niveau de gravité est bien répertorié', () => {
    expect(() => unRisque({ niveauGravite: 'niveauInconnu' })).toThrowError(
      new ErreurNiveauGraviteInconnu(
        'Le niveau de gravité "niveauInconnu" n\'est pas répertorié'
      )
    );
  });
});
