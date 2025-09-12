import { MoteurReglesV2 } from '../../../src/moteurRegles/v2/moteurReglesV2.js';
import { creeReferentiel } from '../../../src/referentiel.js';
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

    expect(mesures).toEqual({ 'RECENSEMENT.1': { indispensable: false } });
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

    expect(mesures).toEqual({ 'RECENSEMENT.1': { indispensable: true } });
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

    expect(mesures).toEqual({ 'RECENSEMENT.1': { indispensable: false } });
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

    expect(mesures).toEqual({ 'RECENSEMENT.1': { indispensable: false } });
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

    expect(mesures).toEqual({
      'RECENSEMENT.1': { indispensable: true },
    });
  });
});
