$(() => {
  const $champMdp = $('#mot-de-passe');
  const $confirmationMdp = $('#mot-de-passe-confirmation');

  const verifieMotDePasse = () => {
    const erreur = $champMdp.val() !== $confirmationMdp.val()
      ? 'erreurDoubleSaisieAvecDifference'
      : '';
    $confirmationMdp.get(0).setCustomValidity(erreur);
  };

  $champMdp.on('input', verifieMotDePasse);
  $confirmationMdp.on('input', verifieMotDePasse);
});
