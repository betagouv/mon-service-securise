import { MoteurReglesV2 } from '../../../src/moteurRegles/v2/moteurReglesV2.js';
import {
  creeReferentiel,
  creeReferentielVide,
} from '../../../src/referentiel.js';
import { NiveauSecurite } from '../../../donneesReferentielMesuresV2.js';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.js';

function uneDescriptionAuNiveau(niveauDeSecurite: NiveauSecurite) {
  return uneDescriptionV2Valide()
    .avecNiveauSecurite(niveauDeSecurite)
    .construis();
}

describe('Le moteur de règles V2', () => {
  it('renvoie les mesures qui sont dans le socle initial si elles ne sont pas exclues ensuite', () => {
    const referentiel = creeReferentiel();
    const v2 = new MoteurReglesV2(referentiel, [
      { reference: 'RECENSEMENT.1', dansSocleInitial: true, modificateurs: {} },
    ]);

    const peuImporte = uneDescriptionAuNiveau('niveau1');
    const mesures = v2.mesures(peuImporte);

    expect(Object.keys(mesures)).toEqual(['RECENSEMENT.1']);
  });

  it('sait rendre une mesure « Indispensable »', () => {
    const referentiel = creeReferentiel();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: true,
        modificateurs: {
          niveauDeSecurite: [['niveau1', 'RendreIndispensable']],
        },
      },
    ]);

    const serviceNiveau1 = uneDescriptionAuNiveau('niveau1');
    const mesures = v2.mesures(serviceNiveau1);

    expect(mesures['RECENSEMENT.1'].indispensable).toBe(true);
  });

  it('sait rendre une mesure « Recommandée »', () => {
    const referentiel = creeReferentiel();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: true,
        modificateurs: {
          niveauDeSecurite: [['niveau1', 'RendreRecommandee']],
        },
      },
    ]);

    const serviceNiveau1 = uneDescriptionAuNiveau('niveau1');
    const mesures = v2.mesures(serviceNiveau1);

    expect(mesures['RECENSEMENT.1'].indispensable).toBe(false);
  });

  it('sait rajouter une mesure', () => {
    const referentiel = creeReferentiel();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: false, // Pas dans le socle initial
        modificateurs: {
          niveauDeSecurite: [['niveau1', 'Ajouter']],
        },
      },
    ]);

    const serviceNiveau1 = uneDescriptionAuNiveau('niveau1');
    const mesures = v2.mesures(serviceNiveau1);

    expect(mesures['RECENSEMENT.1']).toBeDefined();
  });

  it('sait retirer une mesure', () => {
    const referentiel = creeReferentiel();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: true,
        modificateurs: {
          niveauDeSecurite: [['niveau1', 'Retirer']],
        },
      },
    ]);

    const serviceNiveau1 = uneDescriptionAuNiveau('niveau1');
    const mesures = v2.mesures(serviceNiveau1);

    expect(mesures).toEqual({});
  });

  it('sait combiner « Rajouter » et « Rendre indispensable » sur une même mesure', () => {
    const referentiel = creeReferentiel();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: false,
        modificateurs: {
          niveauDeSecurite: [['niveau1', 'Ajouter']],
          categoriesDonneesTraitees: [
            ['donneesSensibles', 'RendreIndispensable'],
          ],
        },
      },
    ]);

    const serviceQuiCombineDeuxModificateurs = uneDescriptionV2Valide()
      .avecNiveauSecurite('niveau1')
      .avecDonneesTraitees(['donneesSensibles'], [])
      .construis();
    const mesures = v2.mesures(serviceQuiCombineDeuxModificateurs);

    expect(mesures['RECENSEMENT.1'].indispensable).toBe(true);
  });

  it('renvoie les mesures complétées avec leurs données référentielles', () => {
    const referentiel = creeReferentielVide();
    referentiel.recharge({
      mesuresV2: {
        'RECENSEMENT.1': {
          description: 'Recenser…',
          referentiel: 'ANSSI',
          categorie: 'resilience',
        },
      },
    });
    const v2 = new MoteurReglesV2(referentiel, [
      { reference: 'RECENSEMENT.1', dansSocleInitial: true, modificateurs: {} },
    ]);

    const mesures = v2.mesures(uneDescriptionAuNiveau('niveau1'));

    expect(mesures['RECENSEMENT.1'].categorie).toBe('resilience');
    expect(mesures['RECENSEMENT.1'].referentiel).toBe('ANSSI');
    expect(mesures['RECENSEMENT.1'].description).toBe('Recenser…');
  });
});
