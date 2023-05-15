import { initialiseComportementModale } from '../modules/interactions/modale.mjs';

$(() => {
  const $modaleSuppression = $('.modale-suppression-service');
  initialiseComportementModale($modaleSuppression);

  let idServiceCourant;

  const $bouton = $('.bouton-suppression-service', $modaleSuppression);
  $bouton.on('click', () =>
    axios
      .delete(`/api/service/${idServiceCourant}`)
      .then(() => window.location.reload())
  );

  $('.services').on(
    'modaleSuppression',
    (_evenement, { idService, nomService }) => {
      idServiceCourant = idService;
      $('.nom-service', $modaleSuppression).text(nomService);
      $modaleSuppression.trigger('afficheModale');
    }
  );
});
