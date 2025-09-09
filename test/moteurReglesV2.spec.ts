import { Modificateur, MoteurReglesV2 } from '../src/moteurReglesV2.js';
import { creeReferentiel } from '../src/referentiel.js';
import { DescriptionServiceV2 } from '../src/modeles/descriptionServiceV2.js';

describe('Le moteur de règles V2', () => {
  it('renvoie les mesures qui sont dans le socle initial si elles ne sont pas exclues ensuite', () => {
    const referentiel = creeReferentiel();
    const v2 = new MoteurReglesV2(referentiel, [
      { reference: 'PSSI.1', dansSocleInitial: true, modificateurs: {} },
    ]);

    const peuImporte = new DescriptionServiceV2({
      niveauDeSecurite: '',
      nomService: '',
      organisationResponsable: { siret: 'X' },
    });
    const mesures = v2.mesures(peuImporte);

    expect(mesures).toEqual({ 'PSSI.1': {} });
  });

  it('sait rendre une mesure « Indispensable » en fonction du niveau de sécurité', () => {
    const referentiel = creeReferentiel();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'PSSI.1',
        dansSocleInitial: true,
        modificateurs: {
          niveauDeSecurite: ['niveau1', Modificateur.RendreIndispensable],
        },
      },
    ]);

    const serviceNiveau1 = new DescriptionServiceV2({
      niveauDeSecurite: 'niveau1',
      nomService: '',
      organisationResponsable: { siret: 'X' },
    });
    const mesures = v2.mesures(serviceNiveau1);

    expect(mesures).toEqual({ 'PSSI.1': { indispensable: true } });
  });

  it('sait rendre une mesure « Recommandée » en fonction du niveau de sécurité', () => {
    const referentiel = creeReferentiel();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'PSSI.1',
        dansSocleInitial: true,
        modificateurs: {
          niveauDeSecurite: ['niveau1', Modificateur.RendreRecommandee],
        },
      },
    ]);

    const serviceNiveau1 = new DescriptionServiceV2({
      niveauDeSecurite: 'niveau1',
      nomService: '',
      organisationResponsable: { siret: 'X' },
    });
    const mesures = v2.mesures(serviceNiveau1);

    expect(mesures).toEqual({ 'PSSI.1': { indispensable: false } });
  });
});
