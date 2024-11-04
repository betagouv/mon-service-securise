$(() => {
  const modifieLabelConsentement = () => {
    const optOutMatomo = localStorage.getItem('optOutMatomo') === 'true';
    $('#label-consentement-matomo').text(
      optOutMatomo
        ? 'Vous n’êtes actuellement pas suivi(e). Cochez cette case pour ne plus être exclu(e).'
        : 'Vous êtes suivi(e) de manière anonyme. Décochez cette case pour vous exclure du suivi.'
    );
  };

  const chargeEtatInitial = () => {
    const optOutMatomo = localStorage.getItem('optOutMatomo') === 'true';
    $('#consentement-matomo').attr('checked', !optOutMatomo);
    modifieLabelConsentement();
  };

  $('#consentement-matomo').on('change', () => {
    const optOutMatomo = !$('#consentement-matomo').is(':checked');
    localStorage.setItem('optOutMatomo', optOutMatomo);
    modifieLabelConsentement();
  });

  chargeEtatInitial();
});
