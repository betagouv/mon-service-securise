import RisqueGeneral, {
  DonneesRisqueGeneral,
} from '../../src/modeles/risqueGeneral.js';
import RisqueSpecifique, {
  DonneesRisqueSpecifique,
} from '../../src/modeles/risqueSpecifique.js';
import Risques from '../../src/modeles/risques.js';
import RisquesSpecifiques from '../../src/modeles/risquesSpecifiques.js';
import { creeReferentiel } from '../../src/referentiel.js';
import { Referentiel } from '../../src/referentiel.interface.ts';
import { unUUID } from '../constructeurs/UUID.ts';

describe('Les risques liés à un service', () => {
  let referentiel: Referentiel;

  beforeEach(() => {
    referentiel = creeReferentiel();
  });

  const donneesRisqueSpecifique = (
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

  const donneesRisqueGeneral = (
    surcharge?: Partial<DonneesRisqueGeneral>
  ): DonneesRisqueGeneral => ({
    commentaire: 'Un commentaire',
    id: 'R1',
    niveauGravite: 'nonConcerne',
    niveauVraisemblance: 'vraisemblable',
    ...surcharge,
  });

  it('agrègent des risques spécifiques', () => {
    const risques = new Risques(
      {
        risquesSpecifiques: [
          donneesRisqueSpecifique({
            description: 'Un risque spécifique',
            commentaire: 'Un commentaire',
          }),
        ],
      },
      referentiel
    );

    expect(risques.risquesSpecifiques).toBeInstanceOf(RisquesSpecifiques);
  });

  describe('sur demande du statut de saisie', () => {
    it("retournent `A_SAISIR` s'il n'y a encore eu aucune saisie", () => {
      const risques = new Risques({});
      expect(risques.statutSaisie()).toEqual(Risques.A_SAISIR);
    });

    it('retournent `COMPLETES` si tous les risques spécifiques sont complètement saisis', () => {
      referentiel.recharge({ niveauxGravite: { grave: {} } });
      const risques = new Risques(
        {
          risquesSpecifiques: [
            donneesRisqueSpecifique({
              id: unUUID('R'),
              identifiantNumerique: 'RS1',
              intitule: 'Un risque spécifique',
              niveauGravite: 'grave',
              niveauVraisemblance: 'peuVraisemblable',
            }),
          ],
        },
        referentiel
      );

      expect(risques.statutSaisie()).toEqual(Risques.COMPLETES);
    });

    it("retournent `A_COMPLETER` si au moins un risque spécifique n'a pas de description", () => {
      const risques = new Risques(
        {
          risquesSpecifiques: [
            // @ts-expect-error On force une valeur incorrecte
            { commentaire: 'Un commentaire sans description' },
          ],
        },
        referentiel
      );

      expect(risques.statutSaisie()).toEqual(Risques.A_COMPLETER);
    });
  });

  describe('sur demande des risques principaux', () => {
    beforeEach(() => {
      referentiel.recharge({
        risques: { unRisque: {}, unAutreRisque: {} },
        vraisemblancesRisques: { vraisemblable: {} },
        niveauxGravite: {
          negligeable: { position: 0, important: false },
          significatif: { position: 1, important: true },
          critique: { position: 2, important: true },
        },
      });
    });

    it('conservent les risques généraux importants', () => {
      const risques = new Risques(
        {
          risquesGeneraux: [
            donneesRisqueGeneral({
              id: 'unRisque',
              niveauGravite: 'negligeable',
            }),
            donneesRisqueGeneral({
              id: 'unAutreRisque',
              niveauGravite: 'significatif',
            }),
          ],
        },
        referentiel
      );
      const risquesPrincipaux = risques.principaux();

      expect(risquesPrincipaux.length).toEqual(1);
      expect(risquesPrincipaux[0].id).toEqual('unAutreRisque');
    });

    it('conservent les risques spécifiques importants', () => {
      const risques = new Risques(
        {
          risquesSpecifiques: [
            donneesRisqueSpecifique({
              description: 'Un risque',
              niveauGravite: 'negligeable',
            }),
            donneesRisqueSpecifique({
              description: 'Un autre risque',
              niveauGravite: 'significatif',
            }),
          ],
        },
        referentiel
      );
      const risquesPrincipaux = risques.principaux();

      expect(risquesPrincipaux.length).toEqual(1);
      expect(risquesPrincipaux[0].description).toEqual('Un autre risque');
    });

    it('trient les risques par ordre décroisant de gravité', () => {
      const risques = new Risques(
        {
          risquesGeneraux: [
            donneesRisqueGeneral({
              id: 'unRisque',
              niveauGravite: 'negligeable',
            }),
            donneesRisqueGeneral({
              id: 'unAutreRisque',
              niveauGravite: 'significatif',
            }),
          ],
          risquesSpecifiques: [
            donneesRisqueSpecifique({
              description: 'Un risque',
              niveauGravite: 'negligeable',
            }),
            donneesRisqueSpecifique({
              description: 'Un autre risque',
              niveauGravite: 'critique',
            }),
          ],
        },
        referentiel
      );
      const risquesPrincipaux = risques.principaux();

      expect(risquesPrincipaux.length).toEqual(2);
      expect(risquesPrincipaux[0]).toBeInstanceOf(RisqueSpecifique);
      expect(risquesPrincipaux[1]).toBeInstanceOf(RisqueGeneral);
    });
  });

  describe('sur une demande des risques par niveau de gravité', () => {
    it('fusionnent les risques récupérés généraux et spécifiques', () => {
      referentiel.recharge({
        risques: { unRisque: { description: 'Un risque' } },
        niveauxGravite: { grave: {} },
        vraisemblancesRisques: { vraisemblable: {} },
      });
      const risques = new Risques(
        {
          risquesGeneraux: [
            donneesRisqueGeneral({ id: 'unRisque', niveauGravite: 'grave' }),
          ],
          risquesSpecifiques: [
            donneesRisqueSpecifique({
              description: 'Un risque deux',
              niveauGravite: 'grave',
            }),
          ],
        },
        referentiel
      );
      // @ts-expect-error On mock la méthode
      risques.risquesGeneraux.parNiveauGravite = () => ({
        grave: [{ description: 'Un risque' }],
      });
      // @ts-expect-error On mock la méthode
      risques.risquesSpecifiques.parNiveauGravite = (
        risquesParNiveauGravite
      ) => {
        expect(risquesParNiveauGravite).toEqual({
          grave: [{ description: 'Un risque' }],
        });
        return {
          grave: [
            { description: 'Un risque' },
            { description: 'Un risque deux' },
          ],
        };
      };

      expect(risques.parNiveauGravite()).toEqual({
        grave: [
          { description: 'Un risque' },
          { description: 'Un risque deux' },
        ],
      });
    });
  });
});
