import brancheChampsMotDePasse from '../modules/interactions/brancheChampsMotDePasse.mjs';
import {
  brancheValidation,
  declencheValidation,
} from '../modules/interactions/validation.mjs';
import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const reponseAcceptee = (nom) =>
    $(`#${nom}:checked`).val() ? true : undefined;

  const selecteurFormulaire = 'form.mot-de-passe#edition';

  brancheValidation(selecteurFormulaire);
  const $boutonValider = $("button[type = 'submit']", $(selecteurFormulaire));
  $boutonValider.on('click', () => declencheValidation(selecteurFormulaire));

  const $msgErreurChallenge = $(
    '#mot-de-passe-challenge ~ .message-erreur-specifique'
  );
  $('#mot-de-passe-challenge').on('input', () => $msgErreurChallenge.hide());

  $(selecteurFormulaire).on('submit', (e) => {
    e.preventDefault();

    const { enModeInitialisation } = lisDonneesPartagees('mode-initialisation');
    const { estInvitation } = lisDonneesPartagees('invitation-contributeur');
    if (enModeInitialisation) {
      axios
        .put('/api/motDePasse', {
          motDePasse: $('#mot-de-passe').val(),
          cguAcceptees: reponseAcceptee('cguAcceptees'),
          ...(estInvitation && {
            infolettreAcceptee: reponseAcceptee('infolettreAcceptee'),
          }),
        })
        .then(() => (window.location = '/tableauDeBord'));
    } else {
      axios
        .patch('/api/motDePasse', {
          motDePasse: $('#mot-de-passe').val(),
          motDePasseChallenge: $('#mot-de-passe-challenge').val(),
        })
        .then(() => (window.location = '/tableauDeBord'))
        .catch(({ response }) => {
          if (response.status === 401) $msgErreurChallenge.show();
        });
    }
  });

  brancheChampsMotDePasse($(selecteurFormulaire));
});
