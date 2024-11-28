const EVENEMENT_SUPPRESSION_ELEMENT = 'suppressionElement';

const brancheSuppressionElement = () => {
  $('.icone-suppression').click((e) => {
    e.preventDefault();
    $(e.target).parent().remove();
    $('body').trigger(EVENEMENT_SUPPRESSION_ELEMENT);
  });
};

const afficheZoneSaisieItem = (
  selecteur,
  zoneSaisie,
  ordreInverse,
  lectureSeule,
  actionSurZoneSaisieApresAjout = () => {}
) => {
  const $conteneurSaisieItem = $(`
<label class="item-ajoute">
  ${lectureSeule ? '' : '<div class="icone-suppression"></div>'}
</label>
  `);

  const methodeAjout = ordreInverse ? 'prepend' : 'append';
  $(selecteur)[methodeAjout]($conteneurSaisieItem);
  brancheSuppressionElement();

  $conteneurSaisieItem.append(zoneSaisie);

  actionSurZoneSaisieApresAjout($conteneurSaisieItem);
};

const brancheAjoutItem = (
  selecteurAction,
  selecteurConteneur,
  cbZoneSaisie,
  cbIncrementeIndex,
  actionSurZoneSaisieApresAjout,
  options = { ordreInverse: false }
) => {
  $(selecteurAction).on('click', (e) => {
    e.preventDefault();
    const index = cbIncrementeIndex();
    afficheZoneSaisieItem(
      selecteurConteneur,
      cbZoneSaisie(index, {}),
      options.ordreInverse,
      false,
      actionSurZoneSaisieApresAjout
    );
  });
};

export {
  brancheAjoutItem,
  brancheSuppressionElement,
  EVENEMENT_SUPPRESSION_ELEMENT,
};
