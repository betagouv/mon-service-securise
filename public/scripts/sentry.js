// La librairie Sentry est chargée via le tag de script de SDK. Nous savons (mieux qu’eslint)
// que cette librairie est connue ici.
$(() => {
  const avantEnvoiSentry = (evenement, detail) => {
    if (
      axios?.isAxiosError(detail?.originalException) &&
      detail?.originalException?.code === 'ECONNABORTED'
    ) {
      return null;
    }
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
