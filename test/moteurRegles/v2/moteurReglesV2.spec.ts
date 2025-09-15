import { MoteurReglesV2 } from '../../../src/moteurRegles/v2/moteurReglesV2.js';
import {
  creeReferentiel,
  creeReferentielVide,
} from '../../../src/referentiel.js';
import { DescriptionServiceV2 } from '../../../src/modeles/descriptionServiceV2.js';

function uneDescriptionAuNiveau(niveauDeSecurite: string) {
  return new DescriptionServiceV2({
    niveauDeSecurite,
    nomService: '',
    organisationResponsable: { siret: 'X' },
    volumetrieDonneesTraitees: 'faible',
    categorieDonneesTraitees: 'donneesSensibles',
  });
}

describe('Le moteur de règles V2', () => {
  it('renvoie les mesures qui sont dans le socle initial si elles ne sont pas exclues ensuite', () => {
    const referentiel = creeReferentiel();
    const v2 = new MoteurReglesV2(referentiel, [
      { reference: 'RECENSEMENT.1', dansSocleInitial: true, modificateurs: {} },
    ]);

    const peuImporte = uneDescriptionAuNiveau('');
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
          categorieDonneesTraitees: [
            ['donneesSensibles', 'RendreIndispensable'],
          ],
        },
      },
    ]);

    const serviceNiveau1AvecNomExemple = uneDescriptionAuNiveau('niveau1');
    const mesures = v2.mesures(serviceNiveau1AvecNomExemple);

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
