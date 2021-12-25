const afficheZoneSaisieItem = (selecteur, zoneSaisie) => {
  const $conteneurSaisieItem = $(`
<label class="item-ajoute">
  <div class="icone-suppression"></div>
</label>
  `);

  $(selecteur).append($conteneurSaisieItem);
  $('.icone-suppression').click((e) => {
    e.preventDefault();
    $(e.target).parent().remove();
  });

  $conteneurSaisieItem.append(zoneSaisie);
};

const brancheAjoutItem = (selecteurAction, selecteurConteneur, cbZoneSaisie, cbIncrementeIndex) => {
  $(selecteurAction).click((e) => {
    e.preventDefault();
    const index = cbIncrementeIndex();
    afficheZoneSaisieItem(selecteurConteneur, cbZoneSaisie(index, {}));
  });
};

const peupleListeItems = (selecteurConteneur, selecteurDonnees, cbZoneSaisie) => {
  const donneesItems = JSON.parse($(selecteurDonnees).text());
  donneesItems.forEach((donnees, index) => {
    afficheZoneSaisieItem(selecteurConteneur, cbZoneSaisie(index, donnees));
  });

  return donneesItems.length;
};

export { brancheAjoutItem, peupleListeItems };
