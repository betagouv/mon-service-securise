import { brancheValidation } from '../modules/interactions/validation.mjs';
import { initialiseComportementModale } from '../modules/interactions/modale.mjs';

const tableauDeLongueur = (longueur) => [...Array(longueur).keys()];

$(() => {
  const $modaleDuplication = $('.modale-duplication-service');
  initialiseComportementModale($modaleDuplication);

  const selecteurFormulaire = '.modale-duplication-service form';
  const $boutonValidation = $('button', $(selecteurFormulaire));
  const $erreurServeur = $('.message-erreur-serveur', $modaleDuplication);

  brancheValidation(selecteurFormulaire);

  $modaleDuplication.on('fermeModale', () => $erreurServeur.hide());

  let idServiceCourant;

  $(selecteurFormulaire).one('submit', (e) => {
    $boutonValidation.addClass('occupe');

    e.preventDefault();
    $erreurServeur.hide();
    const nombreCopies = parseInt($('#nombre-copie').val(), 10) || 1;

    tableauDeLongueur(nombreCopies)
      .reduce(
        (acc) =>
          acc.then(() =>
            axios({ method: 'copy', url: `/api/service/${idServiceCourant}` })
          ),
        Promise.resolve()
      )
      .then(() => {
        $boutonValidation.removeClass('occupe');
        window.location.reload();
      })
      .catch((exc) => {
        $boutonValidation.removeClass('occupe');
        if (exc.response.status !== 424) return;

        $erreurServeur.text(exc.response.data.message).show();
      });
  });

  $('.services').on('modaleDuplication', (_e, { idService, nomService }) => {
    idServiceCourant = idService;
    $('.nom-service', $modaleDuplication).text(nomService);
    $modaleDuplication.trigger('afficheModale');
  });
});
