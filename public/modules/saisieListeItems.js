const brancheSuppressionElement = () => {
  $('.icone-suppression').click((e) => {
    e.preventDefault();
    $(e.target).parent().remove();
  });
};

const afficheZoneSaisieItem = (
  selecteur, zoneSaisie, ordreInverse, actionSurZoneSaisieApresAjout = () => {}
) => {
  const $conteneurSaisieItem = $(`
<label class="item-ajoute">
  <div class="icone-suppression"></div>
</label>
  `);

  const methodeAjout = ordreInverse ? 'prepend' : 'append';
  $(selecteur)[methodeAjout]($conteneurSaisieItem);
  brancheSuppressionElement();

  $conteneurSaisieItem.append(zoneSaisie);

  actionSurZoneSaisieApresAjout($conteneurSaisieItem);
};

const brancheAjoutItem = (
  selecteurAction, selecteurConteneur, cbZoneSaisie, cbIncrementeIndex,
  options = { ordreInverse: false }, actionSurZoneSaisieApresAjout
) => {
  $(selecteurAction).on('click', (e) => {
    e.preventDefault();
    const index = cbIncrementeIndex();
    afficheZoneSaisieItem(
      selecteurConteneur,
      cbZoneSaisie(index, {}),
      options.ordreInverse,
      actionSurZoneSaisieApresAjout
    );
  });
};

const peupleListeItems = (
  selecteurConteneur,
  selecteurDonnees,
  cbZoneSaisie,
  options = { ordreInverse: false },
) => {
  const donneesItems = JSON.parse($(selecteurDonnees).text());
  donneesItems.forEach((donnees, index) => {
    afficheZoneSaisieItem(selecteurConteneur, cbZoneSaisie(index, donnees), options.ordreInverse);
  });

  return donneesItems.length;
};

export {
  brancheAjoutItem,
  peupleListeItems,
  brancheSuppressionElement,
};
