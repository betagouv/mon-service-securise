import { scrubEvenementSentry } from '../../../src/adaptateurs/gestionErreur/scrubbingEvenementSentry.js';

describe('Le scrubbing des événements Sentry', () => {
  it("remplace la valeur d'une clé sensible", () => {
    const evenement = { nomService: 'Service secret' };

    const resultat = scrubEvenementSentry(evenement);

    expect(resultat).toEqual({ nomService: '[Filtré]' });
  });

  it('remplace les clés sensibles dans les objets imbriqués', () => {
    const evenement = {
      extra: {
        body: {
          nomService: 'Service secret',
          organisationResponsable: { nom: 'ANSSI', siret: '12345678901234' },
          statut: 'enCours',
        },
      },
    };

    const resultat = scrubEvenementSentry(evenement);

    expect(resultat).toEqual({
      extra: {
        body: {
          nomService: '[Filtré]',
          organisationResponsable: { nom: '[Filtré]', siret: '[Filtré]' },
          statut: 'enCours',
        },
      },
    });
  });
});

describe('Le scrubbing des événements Sentry dans les tableaux', () => {
  it('conserve les tableaux et y remplace les clés sensibles', () => {
    const evenement = {
      breadcrumbs: [
        { category: 'xhr', data: { siret: '12345678901234' } },
        { category: 'console', data: { message: 'rien de sensible' } },
      ],
    };

    const resultat = scrubEvenementSentry(evenement);

    expect(resultat).toEqual({
      breadcrumbs: [
        { category: 'xhr', data: { siret: '[Filtré]' } },
        { category: 'console', data: { message: 'rien de sensible' } },
      ],
    });
  });
});

describe('Le scrubbing des événements Sentry sur les en-têtes HTTP', () => {
  it("remplace l'en-tête Authorization quelle que soit sa casse", () => {
    const evenement = {
      request: {
        headers: {
          Authorization: 'Bearer cle-api-secrete',
          authorization: 'Bearer cle-api-secrete',
          'content-type': 'application/json',
        },
      },
    };

    const resultat = scrubEvenementSentry(evenement);

    expect(resultat).toEqual({
      request: {
        headers: {
          Authorization: '[Filtré]',
          authorization: '[Filtré]',
          'content-type': 'application/json',
        },
      },
    });
  });
});

describe('Le scrubbing des événements Sentry sur les jetons Bearer', () => {
  it('masque un jeton Bearer présent dans une chaîne de caractères', () => {
    const evenement = {
      message: 'Appel refusé avec Authorization: Bearer cle-api-secrete (401)',
    };

    const resultat = scrubEvenementSentry(evenement);

    expect(resultat).toEqual({
      message: 'Appel refusé avec Authorization: Bearer [Filtré] (401)',
    });
  });
});
