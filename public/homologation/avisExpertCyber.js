import parametres from '../modules/parametres.js';

const conditionneAffichageRenouvellement = (selecteurAvis, selecteurRenouvellement, condition) => {
  const $avis = $(selecteurAvis);
  const $fieldsetRenouvellement = $(selecteurRenouvellement).parent();
  $fieldsetRenouvellement.toggle(condition());

  $avis.change(() => {
    const fieldsetRenouvellementDoitEtreAffiche = condition();

    if (!fieldsetRenouvellementDoitEtreAffiche) $(selecteurRenouvellement).prop('checked', false);
    $fieldsetRenouvellement.toggle(fieldsetRenouvellementDoitEtreAffiche);
  });
};

$(() => {
  conditionneAffichageRenouvellement(
    'input[name=avis]',
    'input[name=dateRenouvellement]',
    () => $('input[id=avis-favorable]').prop('checked')
  );

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    const params = parametres('form#avis-expert-cyber');
    axios.post(`/api/homologation/${identifiantHomologation}/avisExpertCyber`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
