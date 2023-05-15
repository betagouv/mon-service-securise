const SELECTEUR_ONGLETS = '.onglet';
const PREFIX_IDENTIFIANT_ONGLETS = 'onglet-';
const CLASSE_LIEN_ACTIF = 'actif';
const CLASSE_ONGLET_INVISIBLE = 'invisible';

const identifiantOngletActif = (selecteurLienActif) =>
  $(selecteurLienActif).prop('id').slice(PREFIX_IDENTIFIANT_ONGLETS.length);

const brancheOnglets = (selecteurLiens) => {
  $(SELECTEUR_ONGLETS).addClass(CLASSE_ONGLET_INVISIBLE);

  const selecteurLienActif = `${selecteurLiens}.${CLASSE_LIEN_ACTIF}`;
  $(`#${identifiantOngletActif(selecteurLienActif)}`).removeClass(
    CLASSE_ONGLET_INVISIBLE
  );

  $(selecteurLiens).on('click', (event) => {
    $(selecteurLiens).removeClass(CLASSE_LIEN_ACTIF);
    $(event.target).addClass(CLASSE_LIEN_ACTIF);

    $(SELECTEUR_ONGLETS).addClass(CLASSE_ONGLET_INVISIBLE);
    $(`#${identifiantOngletActif(event.target)}`).removeClass(
      CLASSE_ONGLET_INVISIBLE
    );
  });
};

export default brancheOnglets;
