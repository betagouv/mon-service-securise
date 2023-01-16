import { valideMotDePasse } from './validationMotDePasse.mjs';

$(() => {
  const $champMdp = $('#mot-de-passe');
  const $confirmationMdp = $('#mot-de-passe-confirmation');

  const verifieMotDePasse = () => {
    const erreur = $champMdp.val() !== $confirmationMdp.val()
      ? 'erreurDoubleSaisieAvecDifference'
      : '';
    $confirmationMdp.get(0).setCustomValidity(erreur);
  };

  const verifieRobustesse = () => {
    const motDePasse = $champMdp.val();
    const resultatValidation = valideMotDePasse(motDePasse);

    $champMdp.get(0).setCustomValidity(resultatValidation);
  };

  $champMdp.on('input', verifieMotDePasse);
  $champMdp.on('input', verifieRobustesse);
  $confirmationMdp.on('input', verifieMotDePasse);
});
