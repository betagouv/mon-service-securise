import { annexeDesMesures } from '../../../src/modeles/objetsPowerpoint/annexeDesMesures.js';
import { unService } from '../../constructeurs/constructeurService.js';
import * as Referentiel from '../../../src/referentiel.js';
import Mesures from '../../../src/modeles/mesures.js';
import { donneesReferentielDeTest } from '../../constructeurs/referentielDeTest.ts';

describe('L’annexe des mesures présentée à la commission', () => {
  const referentiel = Referentiel.creeReferentiel(
    donneesReferentielDeTest({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        protection: 'Protection',
      },
      mesures: {
        A: {
          description: 'Mesure A',
          categorie: 'gouvernance',
          indispensable: true,
          referentiel: 'ANSSI',
        },
        B: {
          description: 'Mesure B',
          categorie: 'protection',
          referentiel: 'CNIL',
        },
        C: {
          description: 'Mesure C',
          categorie: 'protection',
          referentiel: 'ANSSI',
        },
        D: { description: 'Mesure D' },
        E: { description: 'Mesure E' },
        F: { description: 'Mesure F' },
      },
      statutsMesures: {
        fait: 'Faite',
        enCours: 'Partielle',
        nonFait: 'Non prise en compte',
        aLancer: 'À lancer',
      },
    })
  );

  const mesuresPersonnalisees = { A: {}, B: {}, C: {}, D: {}, E: {} };

  const descriptionsParStatut = (mesures: Mesures) =>
    annexeDesMesures(
      unService(referentiel).avecMesures(mesures).construis()
    ).map(({ statut, mesures: mesuresDuStatut }) => ({
      statut,
      descriptions: mesuresDuStatut.map(({ description }) => description),
    }));

  it('range les mesures générales applicables par statut, dans l’ordre de la maquette et du référentiel, sans les non prises en compte', () => {
    const mesures = new Mesures(
      {
        mesuresGenerales: [
          { id: 'E', statut: 'fait' },
          { id: 'A', statut: 'fait' },
          { id: 'B', statut: 'aLancer' },
          { id: 'C', statut: 'nonFait' },
        ],
      },
      referentiel,
      mesuresPersonnalisees
    );

    expect(descriptionsParStatut(mesures)).toEqual([
      { statut: 'fait', descriptions: ['Mesure A', 'Mesure E'] },
      { statut: 'aLancer', descriptions: ['Mesure B'] },
      { statut: 'sansStatut', descriptions: ['Mesure D'] },
    ]);
  });

  it('ajoute les mesures spécifiques après les générales de leur statut, avec la criticité « Spécifique » et le référentiel « Mesures ajoutées »', () => {
    const service = unService(referentiel)
      .avecMesures(
        new Mesures(
          {
            mesuresGenerales: [{ id: 'A', statut: 'fait' }],
            mesuresSpecifiques: [
              {
                description: 'Spécifique faite',
                categorie: 'protection',
                statut: 'fait',
              },
              {
                description: 'Spécifique non prise en compte',
                categorie: 'protection',
                statut: 'nonFait',
              },
            ],
          },
          referentiel,
          { A: {} }
        )
      )
      .construis();

    expect(annexeDesMesures(service)).toEqual([
      {
        statut: 'fait',
        mesures: [
          expect.objectContaining({ description: 'Mesure A' }),
          {
            description: 'Spécifique faite',
            categorie: 'Protection',
            criticite: 'Spécifique',
            referentiel: 'Mesures ajoutées',
          },
        ],
      },
    ]);
  });

  it('donne la catégorie, la criticité et le référentiel de chaque mesure générale', () => {
    const service = unService(referentiel)
      .avecMesures(
        new Mesures(
          {
            mesuresGenerales: [
              { id: 'A', statut: 'fait' },
              { id: 'B', statut: 'fait' },
              { id: 'C', statut: 'fait' },
            ],
          },
          referentiel,
          { A: {}, B: { indispensable: true }, C: {} }
        )
      )
      .construis();

    expect(annexeDesMesures(service)).toEqual([
      {
        statut: 'fait',
        mesures: [
          {
            description: 'Mesure A',
            categorie: 'Gouvernance',
            criticite: 'Indispensable',
            referentiel: 'ANSSI',
          },
          {
            description: 'Mesure B',
            categorie: 'Protection',
            criticite: 'Indispensable',
            referentiel: 'CNIL',
          },
          {
            description: 'Mesure C',
            categorie: 'Protection',
            criticite: 'Recommandée',
            referentiel: 'ANSSI',
          },
        ],
      },
    ]);
  });
});
