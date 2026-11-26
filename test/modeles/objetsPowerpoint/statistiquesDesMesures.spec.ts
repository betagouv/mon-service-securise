import { statistiquesDesMesures } from '../../../src/modeles/objetsPowerpoint/statistiquesDesMesures.js';
import { unService } from '../../constructeurs/constructeurService.js';
import * as Referentiel from '../../../src/referentiel.js';
import Mesures from '../../../src/modeles/mesures.js';
import { donneesReferentielDeTest } from '../../constructeurs/referentielDeTest.ts';
import {
  mesuresPersonnaliseesDeTest,
  mesuresSpecifiquesDeTest,
} from '../../constructeurs/mesuresDeTest.ts';

describe('Les statistiques des mesures présentées à la commission', () => {
  const referentiel = Referentiel.creeReferentiel(
    donneesReferentielDeTest({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        protection: 'Protection',
      },
      mesures: { A: {}, B: {}, C: {} },
      statutsMesures: {
        fait: 'Faite',
        enCours: 'Partielle',
        nonFait: 'Non prise en compte',
        aLancer: 'À lancer',
      },
      articlesDefinisReferentielsMesure: { ANSSI: "l'", CNIL: 'la ' },
    })
  );

  const unServiceAvecSesMesures = () =>
    unService(referentiel)
      .avecMesures(
        new Mesures(
          {
            mesuresGenerales: [
              { id: 'A', statut: 'fait' },
              { id: 'B', statut: 'enCours' },
            ],
            mesuresSpecifiques: mesuresSpecifiquesDeTest([
              {
                description: 'Une mesure',
                categorie: 'protection',
                statut: 'aLancer',
              },
            ]),
          },
          referentiel,
          mesuresPersonnaliseesDeTest({
            A: {
              categorie: 'gouvernance',
              indispensable: true,
              referentiel: 'ANSSI',
            },
            B: {
              categorie: 'protection',
              indispensable: true,
              referentiel: 'ANSSI',
            },
            C: { categorie: 'protection', referentiel: 'CNIL' },
          })
        )
      )
      .construis();

  it('comptent les mesures proposées par les référentiels et celles ajoutées par l’équipe', () => {
    const statistiques = statistiquesDesMesures(unServiceAvecSesMesures());

    expect(statistiques.nombreDeMesuresGenerales).toBe(3);
    expect(statistiques.nombreDeMesuresSpecifiques).toBe(1);
    expect(statistiques.referentiels).toBe("l'ANSSI et la CNIL");
  });

  it('répartissent les mesures générales par niveau de criticité et par statut, sans les mesures spécifiques', () => {
    const { parCriticite } = statistiquesDesMesures(unServiceAvecSesMesures());

    expect(parCriticite).toEqual({
      indispensables: {
        fait: 1,
        enCours: 1,
        nonFait: 0,
        aLancer: 0,
        aRemplir: 0,
        restant: 1,
      },
      recommandees: {
        fait: 0,
        enCours: 0,
        nonFait: 0,
        aLancer: 0,
        aRemplir: 1,
        restant: 1,
      },
    });
  });

  it('répartissent les mesures générales par catégorie et par statut, avec le total de chaque catégorie, sans les mesures spécifiques', () => {
    const { parCategorie } = statistiquesDesMesures(unServiceAvecSesMesures());

    expect(parCategorie).toEqual([
      {
        libelle: 'Gouvernance',
        fait: 1,
        enCours: 0,
        nonFait: 0,
        aLancer: 0,
        aRemplir: 0,
        total: 1,
      },
      {
        libelle: 'Protection',
        fait: 0,
        enCours: 1,
        nonFait: 0,
        aLancer: 0,
        aRemplir: 1,
        total: 2,
      },
    ]);
  });
});
