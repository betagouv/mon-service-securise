import parametres from '../modules/parametres.mjs';

const conditionneAffichageRenouvellement = (
  selecteurAvis,
  selecteurRenouvellement,
  condition
) => {
  const $avis = $(selecteurAvis);
  const $fieldsetRenouvellement = $(selecteurRenouvellement).parent();
  $fieldsetRenouvellement.toggle(condition());

  $avis.change(() => {
    const fieldsetRenouvellementDoitEtreAffiche = condition();

    if (!fieldsetRenouvellementDoitEtreAffiche)
      $(selecteurRenouvellement).prop('checked', false);
    $fieldsetRenouvellement.toggle(fieldsetRenouvellementDoitEtreAffiche);
  });
};

$(() => {
  conditionneAffichageRenouvellement(
    'input[name=avis]',
    'input[name=dateRenouvellement]',
    () => $('input[id=avis-favorable]').prop('checked')
  );

  const $bouton = $('.bouton[idHomologation]');
  const identifiantService = $bouton.attr('idHomologation');

  $bouton.click(() => {
    const params = parametres('form#avis-expert-cyber');
    axios
      .post(`/api/service/${identifiantService}/avisExpertCyber`, params)
      .then(
        (reponse) => (window.location = `/service/${reponse.data.idService}`)
      );
  });
});
