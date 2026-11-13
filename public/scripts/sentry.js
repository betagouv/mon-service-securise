// La librairie Sentry est chargée via le tag de script de SDK. Nous savons (mieux qu’eslint)
// que cette librairie est connue ici.
$(() => {
  // Voir l'issue https://github.com/axios/axios/issues/6209#issuecomment-2299747509
  const avantEnvoiSentry = (evenement, detail) => {
    const erreur = detail?.originalException;
    if (!axios?.isAxiosError(erreur)) return evenement;

    const connexionInterrompue = erreur.code === 'ECONNABORTED';
    const requeteInvalide = erreur.response?.status === 400;
    const ressourceIntrouvable = erreur.response?.status === 404;
    if (connexionInterrompue || requeteInvalide || ressourceIntrouvable)
      return null;

    return evenement;
  };

  // eslint-disable-next-line no-undef
  Sentry.init({
    dsn: $('#script-sentry').data('dsn'),
    environment: $('#script-sentry').data('environnement'),
    denyUrls: [/\/bibliotheques\/matomo.js/],
    beforeSend: avantEnvoiSentry,
  });
  // eslint-disable-next-line no-undef
  Sentry.setTag('mss-source', 'frontend');
});
