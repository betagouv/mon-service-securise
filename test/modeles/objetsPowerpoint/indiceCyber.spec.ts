import { indiceCyber } from '../../../src/modeles/objetsPowerpoint/indiceCyber.js';
import { unService } from '../../constructeurs/constructeurService.js';
import * as Referentiel from '../../../src/referentiel.js';
import Mesures from '../../../src/modeles/mesures.js';

describe('L’indice cyber présenté à la commission', () => {
  const referentiel = Referentiel.creeReferentiel({
    indiceCyber: {
      coefficientIndispensables: 0.8,
      coefficientRecommandees: 0.2,
      coefficientStatutPartiel: 0.5,
      noteMax: 5,
    },
    categoriesMesures: {
      gouvernance: 'Gouvernance',
      protection: 'Protection',
      defense: 'Défense',
      resilience: 'Résilience',
    },
    // @ts-expect-error on recharge partiellement le référentiel
    mesures: { A: {}, B: {}, C: {}, D: {} },
    statutsMesures: {
      fait: 'Faite',
      enCours: 'Partielle',
      nonFait: 'Non prise en compte',
      aLancer: 'À lancer',
    },
    articlesDefinisReferentielsMesure: { ANSSI: "l'", CNIL: 'la ' },
  });

  const unServiceAvecSesMesures = () =>
    unService(referentiel)
      .avecNomService('Mon service')
      .avecMesures(
        new Mesures(
          {
            mesuresGenerales: [
              { id: 'A', statut: 'fait' },
              { id: 'B', statut: 'enCours' },
              { id: 'C', statut: 'nonFait' },
              { id: 'D', statut: 'nonFait' },
            ],
          },
          referentiel,
          {
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
            C: {
              categorie: 'defense',
              indispensable: true,
              referentiel: 'CNIL',
            },
            D: {
              categorie: 'resilience',
              indispensable: true,
              referentiel: 'ANSSI',
            },
          }
        )
      )
      .construis();

  it('nomme le service', () => {
    const indice = indiceCyber(unServiceAvecSesMesures());

    expect(indice.nomService).toBe('Mon service');
  });

  it('donne l’indice cyber ANSSI et l’indice cyber personnalisé', () => {
    const indice = indiceCyber(unServiceAvecSesMesures());

    expect(indice.total).toBe(1.875);
    expect(indice.totalPersonnalise).toBe(3.75);
  });

  it('donne la note maximale du référentiel', () => {
    const indice = indiceCyber(unServiceAvecSesMesures());

    expect(indice.noteMax).toBe(5);
  });

  it('donne l’indice cyber ANSSI de chaque catégorie, dans l’ordre du référentiel', () => {
    const indice = indiceCyber(unServiceAvecSesMesures());

    expect(indice.categories).toEqual([
      { libelle: 'Gouvernance', note: 5 },
      { libelle: 'Protection', note: 2.5 },
      { libelle: 'Défense', note: 0 },
      { libelle: 'Résilience', note: 0 },
    ]);
  });

  it('nomme les référentiels des mesures proposées au service, sans doublon', () => {
    const indice = indiceCyber(unServiceAvecSesMesures());

    expect(indice.referentiels).toBe("l'ANSSI et la CNIL");
  });
});
