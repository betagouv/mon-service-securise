const CLASSE_ELEMENT_INVISIBLE = 'invisible';

const mesureSpecifiqueDeCategorie = (elementMesureSpecifique, categorieFiltre) => !categorieFiltre
  || $(`option[value="${categorieFiltre}"]:selected, option[value=""]:selected`, elementMesureSpecifique).length === 1;

const mesureGeneraleDeCategorie = (elementMesure, categorieFiltre) => !categorieFiltre
  || $(elementMesure).hasClass(categorieFiltre);

const filtreMesures = (categorie, selecteurMesureGenerale, selecteurMesureSpecifique) => {
  $(selecteurMesureGenerale).each((_, item) => $(item)
    .toggleClass(CLASSE_ELEMENT_INVISIBLE, !mesureGeneraleDeCategorie(item, categorie)));

  $(selecteurMesureSpecifique).each((_, item) => $(item)
    .toggleClass(CLASSE_ELEMENT_INVISIBLE, !mesureSpecifiqueDeCategorie(item, categorie)));
};

const brancheFiltresMesures = (
  classeFiltreActif,
  selecteurFiltres,
  selecteurMesureGenerale,
  selecteurMesureSpecifique
) => {
  const $filtres = $(selecteurFiltres);
  $filtres.each((_, f) => {
    $(f).on('click', (e) => {
      $(`.${classeFiltreActif}`).removeClass(classeFiltreActif);
      $(e.target).addClass(classeFiltreActif);

      const idCategorie = e.target.id;
      filtreMesures(idCategorie, selecteurMesureGenerale, selecteurMesureSpecifique);
    });
  });
};

export default brancheFiltresMesures;
