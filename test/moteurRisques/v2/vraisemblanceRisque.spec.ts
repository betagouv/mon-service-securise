import { VraisemblanceRisque } from '../../../src/moteurRisques/v2/vraisemblanceRisque.ts';
import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.ts';
import {
  ConfigurationPourNiveau,
  ConfigurationVraisemblancePourUnVecteur,
} from '../../../src/moteurRisques/v2/vraisemblance.types.ts';
import { NiveauSecurite } from '../../../donneesReferentielMesuresV2.ts';
import Mesures from '../../../src/modeles/mesures.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';

describe('Le calcul de vraisemblance pour un risque', () => {
  const configurationVraisemblance = (
    surcharge?: Partial<Record<NiveauSecurite, ConfigurationPourNiveau>>
  ): ConfigurationVraisemblancePourUnVecteur => ({
    niveau1: {
      formules: [() => 3],
      groupes: {},
    },
    niveau2: {
      formules: [],
      groupes: {},
    },
    niveau3: {
      formules: [],
      groupes: {},
    },
    ...surcharge,
  });

  const donneesServiceNiveau1 = () =>
    unServiceV2().avecDescription(
      uneDescriptionV2Valide()
        .avecNiveauSecurite('niveau1')
        .donneesDescription()
    );

  const unServiceDeNiveau1 = () => donneesServiceNiveau1().construis();

  it('utilise les formules du niveau de sécurité du service pour calculer la vraisemblance', () => {
    const v = new VraisemblanceRisque(
      configurationVraisemblance({
        niveau1: {
          formules: [() => 3],
          groupes: {},
        },
      })
    );
    const service = unServiceDeNiveau1();

    const vraisemblance = v.calculePourService(service);

    expect(vraisemblance).toBe(3);
  });

  it('retourne la vraisemblance maximale entre toutes les formules calculées', () => {
    const v = new VraisemblanceRisque(
      configurationVraisemblance({
        niveau1: {
          formules: [() => 3, () => 4],
          groupes: {},
        },
      })
    );
    const service = unServiceDeNiveau1();

    const vraisemblance = v.calculePourService(service);

    expect(vraisemblance).toBe(4);
  });

  describe('concernant les groupes de mesures', () => {
    it('utilise les groupes de mesures personnalisées pour calculer les formules', () => {
      const v = new VraisemblanceRisque(
        configurationVraisemblance({
          niveau1: {
            groupes: {
              a: { poids: 1, idsMesures: ['RECENSEMENT.1'] },
            },
            formules: [({ a }) => a.length],
          },
        })
      );
      const referentiel = creeReferentielV2();

      const service = donneesServiceNiveau1()
        .avecMesures(
          new Mesures(
            { mesuresGenerales: [{ id: 'RECENSEMENT.1' }] },
            // @ts-expect-error L'objet Mesures devrait pouvoir prendre un ReferentielV2
            referentiel,
            { 'RECENSEMENT.1': { categorie: 'gouvernance' } }
          )
        )
        .construis();

      const vraisemblance = v.calculePourService(service);

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
      const referentiel = creeReferentielV2();

      const service = donneesServiceNiveau1()
        .avecMesures(
          new Mesures(
            {
              mesuresGenerales: [
                { id: 'RECENSEMENT.1' },
                { id: 'RECENSEMENT.2' },
              ],
            },
            // @ts-expect-error L'objet Mesures devrait pouvoir prendre un ReferentielV2
            referentiel,
            {
              'RECENSEMENT.1': { categorie: 'gouvernance' },
              'RECENSEMENT.2': { categorie: 'gouvernance' },
            }
          )
        )
        .construis();

      const vraisemblance = v.calculePourService(service);

      expect(vraisemblance).toBe(2);
    });

    it('utilise les poids de chaque groupe', () => {
      const v = new VraisemblanceRisque(
        configurationVraisemblance({
          niveau1: {
            groupes: {
              a: { poids: 2, idsMesures: ['RECENSEMENT.1'] },
              b: { poids: 3, idsMesures: ['RECENSEMENT.2'] },
            },
            formules: [
              ({ a, b, poidsA, poidsB }) =>
                poidsA * a.length + poidsB * b.length,
            ],
          },
        })
      );
      const referentiel = creeReferentielV2();

      const service = donneesServiceNiveau1()
        .avecMesures(
          new Mesures(
            {
              mesuresGenerales: [
                { id: 'RECENSEMENT.1' },
                { id: 'RECENSEMENT.2' },
              ],
            },
            // @ts-expect-error L'objet Mesures devrait pouvoir prendre un ReferentielV2
            referentiel,
            {
              'RECENSEMENT.1': { categorie: 'gouvernance' },
              'RECENSEMENT.2': { categorie: 'gouvernance' },
            }
          )
        )
        .construis();

      const vraisemblance = v.calculePourService(service);

      expect(vraisemblance).toBe(5);
    });
  });
});
