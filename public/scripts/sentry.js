$(() => {
  Sentry.init({
    dsn: $('#script-sentry').data('dsn'),
    environment: $('#script-sentry').data('environnement'),
  });
  Sentry.setTag('mss-source', 'frontend');
});
