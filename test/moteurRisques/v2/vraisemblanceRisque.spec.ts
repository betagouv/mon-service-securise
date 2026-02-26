import { VraisemblanceRisque } from '../../../src/moteurRisques/v2/vraisemblanceRisque.ts';
import {
  ConfigurationPourNiveau,
  ConfigurationVraisemblancePourUnVecteur,
  MesureAvecStatut,
} from '../../../src/moteurRisques/v2/vraisemblance/vraisemblance.types.ts';
import {
  IdMesureV2,
  NiveauSecurite,
} from '../../../donneesReferentielMesuresV2.ts';
import Mesures from '../../../src/modeles/mesures.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import { unServiceV2 } from '../../constructeurs/constructeurService.js';

describe('Le calcul de vraisemblance pour un risque', () => {
  const configurationVraisemblance = (
    surcharge?: Partial<Record<NiveauSecurite, ConfigurationPourNiveau>>
  ): ConfigurationVraisemblancePourUnVecteur => ({
    niveau1: { formules: [() => 3], groupes: {} },
    niveau2: { formules: [], groupes: {} },
    niveau3: { formules: [], groupes: {} },
    ...surcharge,
  });

  it('utilise les formules du niveau de sécurité du service pour calculer la vraisemblance', () => {
    const v = new VraisemblanceRisque(
      configurationVraisemblance({
        niveau1: { formules: [() => 3], groupes: {} },
      })
    );

    const vraisemblance = v.calculePourService('niveau1', {});

    expect(vraisemblance).toBe(3);
  });

  it('ne dépasse jamais 4, qui est la vraisemblance maximale', () => {
    const v = new VraisemblanceRisque(
      configurationVraisemblance({
        niveau1: { formules: [() => 6], groupes: {} },
      })
    );

    const vraisemblance = v.calculePourService('niveau1', {});

    expect(vraisemblance).toBe(4);
  });

  it('retourne la vraisemblance maximale entre toutes les formules calculées', () => {
    const v = new VraisemblanceRisque(
      configurationVraisemblance({
        niveau1: { formules: [() => 3, () => 4], groupes: {} },
      })
    );

    const vraisemblance = v.calculePourService('niveau1', {});

    expect(vraisemblance).toBe(4);
  });

  describe('concernant les groupes de mesures', () => {
    const desMesuresPersonnalisees = (
      mesuresGenerales: Array<{ id: IdMesureV2 }>
    ): Record<string, MesureAvecStatut> => {
      const referentiel = creeReferentielV2();

      const service = unServiceV2()
        .avecMesures(
          new Mesures(
            { mesuresGenerales },
            // @ts-expect-error L'objet Mesures devrait pouvoir prendre un ReferentielV2
            referentiel,
            Object.fromEntries(mesuresGenerales.map((m) => [m.id, {}]))
          )
        )
        .construis();

      return service.mesures.enrichiesAvecDonneesPersonnalisees()
        .mesuresGenerales as Record<string, MesureAvecStatut>;
    };

    it('utilise les groupes de mesures personnalisées pour calculer les formules', () => {
      const v = new VraisemblanceRisque(
        configurationVraisemblance({
          niveau1: {
            groupes: { a: { poids: 1, idsMesures: ['RECENSEMENT.1'] } },
            formules: [({ a }) => a.length],
          },
        })
      );
      const mesures = desMesuresPersonnalisees([{ id: 'RECENSEMENT.1' }]);

      const vraisemblance = v.calculePourService('niveau1', mesures);

      expect(vraisemblance).toBe(1);
    });

    it('utilise tous les groupes présent dans la configuration', () => {
      const v = new VraisemblanceRisque(
        configurationVraisemblance({
          niveau1: {
            groupes: {
              a: { poids: 1, idsMesures: ['RECENSEMENT.1'] },
              b: { poids: 1, idsMesures: ['RECENSEMENT.2'] },
            },
            formules: [({ a, b }) => a.length + b.length],
          },
        })
      );
      const mesures = desMesuresPersonnalisees([
        { id: 'RECENSEMENT.1' },
        { id: 'RECENSEMENT.2' },
      ]);

      const vraisemblance = v.calculePourService('niveau1', mesures);

      expect(vraisemblance).toBe(2);
    });

    it('utilise les poids de chaque groupe', () => {
      const v = new VraisemblanceRisque(
        configurationVraisemblance({
          niveau1: {
            groupes: {
              a: { poids: 2, idsMesures: ['RECENSEMENT.1'] },
              b: { poids: 1, idsMesures: ['RECENSEMENT.2'] },
            },
            formules: [
              ({ a, b, poidsA, poidsB }) =>
                poidsA * a.length + poidsB * b.length,
            ],
          },
        })
      );
      const mesures = desMesuresPersonnalisees([
        { id: 'RECENSEMENT.1' },
        { id: 'RECENSEMENT.2' },
      ]);

      const vraisemblance = v.calculePourService('niveau1', mesures);

      expect(vraisemblance).toBe(3);
    });

    it("considère chaque mesure absente du service comme « faite » : c'est la règle métier pour cohabiter avec moteur de règles v2", () => {
      const v = new VraisemblanceRisque(
        configurationVraisemblance({
          niveau1: {
            groupes: {
              a: { poids: 1, idsMesures: ['RECENSEMENT.1'] },
            },
            formules: [
              ({ a }) => a.filter((mesure) => mesure.statut === 'fait').length,
            ],
          },
        })
      );
      const mesures = desMesuresPersonnalisees([]);

      const vraisemblance = v.calculePourService('niveau1', mesures);

      expect(vraisemblance).toBe(1);
    });
  });
});
