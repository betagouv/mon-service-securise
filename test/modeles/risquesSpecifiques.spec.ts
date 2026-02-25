import RisqueSpecifique, {
  DonneesRisqueSpecifique,
} from '../../src/modeles/risqueSpecifique.js';
import RisquesSpecifiques from '../../src/modeles/risquesSpecifiques.js';
import { Referentiel } from '../../src/referentiel.interface.ts';
import { creeReferentiel } from '../../src/referentiel.js';
import { unUUID } from '../constructeurs/UUID.ts';

describe('La liste des risques spécifiques', () => {
  let referentiel: Referentiel;

  beforeEach(() => {
    referentiel = creeReferentiel();
  });

  const donneesRisque = (
    surcharge?: Partial<DonneesRisqueSpecifique>
  ): DonneesRisqueSpecifique => ({
    description: 'Un risque spécifique',
    commentaire: 'Un commentaire',
    id: unUUID('R'),
    niveauGravite: 'nonConcerne',
    niveauVraisemblance: 'vraisemblable',
    intitule: 'un intitulé',
    categories: ['disponibilite'],
    identifiantNumerique: '0001',
    ...surcharge,
  });

  it('sait se dénombrer', () => {
    const risques = new RisquesSpecifiques(
      { risquesSpecifiques: [] },
      referentiel
    );
    expect(risques.nombre()).toEqual(0);
  });

  it('est composée de risques spécifiques', () => {
    const risques = new RisquesSpecifiques(
      { risquesSpecifiques: [donneesRisque()] },
      referentiel
    );

    expect(risques.item(0)).toBeInstanceOf(RisqueSpecifique);
  });

  it("n'écrase jamais l'identifiant numérique sur mise à jour", () => {
    const listeRisques = new RisquesSpecifiques(
      {
        risquesSpecifiques: [
          donneesRisque({ id: unUUID('R'), identifiantNumerique: 'RS2' }),
        ],
      },
      referentiel
    );
    const risque = new RisqueSpecifique(
      donneesRisque({ id: unUUID('R'), identifiantNumerique: 'nouvelle' }),
      referentiel
    );

    listeRisques.metsAJourRisque(risque);

    expect(listeRisques.item(0).identifiantNumerique).toBe('RS2');
  });
});
