import { exigencesRestantes } from '../../../src/modeles/objetsPowerpoint/exigencesRestantes.js';
import { unService } from '../../constructeurs/constructeurService.js';
import * as Referentiel from '../../../src/referentiel.js';
import Mesures from '../../../src/modeles/mesures.js';

describe('Les exigences restantes présentées à la commission', () => {
  const referentiel = Referentiel.creeReferentiel({
    // @ts-expect-error on recharge partiellement le référentiel
    categoriesMesures: {
      gouvernance: 'Gouvernance',
      protection: 'Protection',
    },
    mesures: {
      // @ts-expect-error on recharge partiellement le référentiel
      A: { description: 'Mesure A' },
      B: { description: 'Mesure B' },
      C: { description: 'Mesure C' },
      D: { description: 'Mesure D' },
      E: { description: 'Mesure E' },
    },
    statutsMesures: {
      fait: 'Faite',
      enCours: 'Partielle',
      nonFait: 'Non prise en compte',
      aLancer: 'À lancer',
    },
  });

  const mesuresPersonnalisees = { A: {}, B: {}, C: {}, D: {}, E: {} };

  it('listent les mesures générales partielles et à lancer, dans l’ordre du référentiel', () => {
    const service = unService(referentiel)
      .avecMesures(
        new Mesures(
          {
            mesuresGenerales: [
              { id: 'E', statut: 'aLancer' },
              { id: 'A', statut: 'fait' },
              { id: 'B', statut: 'enCours' },
              { id: 'C', statut: 'nonFait' },
            ],
          },
          referentiel,
          mesuresPersonnalisees
        )
      )
      .construis();

    expect(
      exigencesRestantes(service).map(({ description, statut }) => ({
        description,
        statut,
      }))
    ).toEqual([
      { description: 'Mesure B', statut: 'enCours' },
      { description: 'Mesure E', statut: 'aLancer' },
    ]);
  });

  it('ajoutent à la fin les mesures spécifiques partielles et à lancer', () => {
    const service = unService(referentiel)
      .avecMesures(
        new Mesures(
          {
            mesuresGenerales: [{ id: 'A', statut: 'aLancer' }],
            mesuresSpecifiques: [
              {
                description: 'Spécifique faite',
                categorie: 'protection',
                statut: 'fait',
              },
              {
                description: 'Spécifique partielle',
                categorie: 'protection',
                statut: 'enCours',
              },
            ],
          },
          referentiel,
          mesuresPersonnalisees
        )
      )
      .construis();

    expect(
      exigencesRestantes(service).map(({ description }) => description)
    ).toEqual(['Mesure A', 'Spécifique partielle']);
  });

  it('décrivent chaque mesure par ses cartouches : criticité, référentiel, catégorie et identifiant, ou « Ajoutée » pour une mesure spécifique', () => {
    const referentielAvecDetails = Referentiel.creeReferentiel({
      // @ts-expect-error on recharge partiellement le référentiel
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        protection: 'Protection',
      },
      mesures: {
        // @ts-expect-error on recharge partiellement le référentiel
        A: {
          description: 'Mesure A',
          categorie: 'gouvernance',
          referentiel: 'ANSSI',
          identifiantNumerique: '0022',
          indispensable: true,
        },
        B: {
          description: 'Mesure B',
          categorie: 'protection',
          referentiel: 'CNIL',
          identifiantNumerique: '0087',
        },
      },
      // @ts-expect-error on recharge partiellement le référentiel
      statutsMesures: { enCours: 'Partielle', aLancer: 'À lancer' },
    });
    const service = unService(referentielAvecDetails)
      .avecMesures(
        new Mesures(
          {
            mesuresGenerales: [
              { id: 'A', statut: 'enCours' },
              { id: 'B', statut: 'aLancer' },
            ],
            mesuresSpecifiques: [
              {
                description: 'Spécifique',
                categorie: 'protection',
                statut: 'aLancer',
              },
            ],
          },
          referentielAvecDetails,
          { A: {}, B: {} }
        )
      )
      .construis();

    expect(
      exigencesRestantes(service).map(({ cartouches }) => cartouches)
    ).toEqual([
      ['Indispensable', 'ANSSI', 'Gouvernance', '#0022'],
      ['Recommandée', 'CNIL', 'Protection', '#0087'],
      ['Spécifique', 'Protection', 'Ajoutée'],
    ]);
  });

  it('donnent l’échéance au format jour/mois/année, quand elle est renseignée', () => {
    const service = unService(referentiel)
      .avecMesures(
        new Mesures(
          {
            mesuresGenerales: [
              { id: 'A', statut: 'enCours', echeance: '2026-12-31' },
              { id: 'B', statut: 'aLancer' },
            ],
            mesuresSpecifiques: [
              {
                description: 'Spécifique',
                categorie: 'protection',
                statut: 'aLancer',
                echeance: '2027-02-28',
              },
            ],
          },
          referentiel,
          mesuresPersonnalisees
        )
      )
      .construis();

    expect(exigencesRestantes(service).map(({ echeance }) => echeance)).toEqual(
      ['31/12/2026', undefined, '28/02/2027']
    );
  });

  it('nomment les porteurs d’après la partie responsable des mesures générales', () => {
    const service = unService(referentiel)
      .avecMesures(
        new Mesures(
          {
            mesuresGenerales: [
              { id: 'A', statut: 'enCours' },
              { id: 'B', statut: 'enCours' },
              { id: 'C', statut: 'enCours' },
              { id: 'D', statut: 'enCours' },
            ],
            mesuresSpecifiques: [
              {
                description: 'Spécifique',
                categorie: 'protection',
                statut: 'aLancer',
              },
            ],
          },
          referentiel,
          {
            A: { partieResponsable: 'Projet' },
            B: { partieResponsable: 'Presta' },
            C: { partieResponsable: 'Mixte' },
            D: {},
          }
        )
      )
      .construis();

    expect(exigencesRestantes(service).map(({ porteurs }) => porteurs)).toEqual(
      [
        'Équipe projet',
        'Prestataire',
        'Équipe projet et prestataire',
        undefined,
        undefined,
      ]
    );
  });
});
